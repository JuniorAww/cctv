import React, { useEffect, useRef, useState } from 'react'

async function getFingerprint() {
  try {
    const ua = navigator.userAgent || ''
    const platform = navigator.platform || ''
    const languages = navigator.languages ? navigator.languages.join(',') : navigator.language || ''
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''

    // canvas fingerprint snippet
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext && canvas.getContext('2d')
    let canvasHash = ''
    if (ctx) {
      canvas.width = 200
      canvas.height = 50
      ctx.textBaseline = 'middle'
      ctx.font = "14px 'Arial'"
      ctx.fillStyle = '#f60'
      ctx.fillRect(0, 0, 200, 50)
      ctx.fillStyle = '#069'
      ctx.fillText(ua.slice(0, 50), 2, 25)
      const data = canvas.toDataURL()
      canvasHash = btoa(data).slice(0, 12)
    }

    const raw = [ua, platform, languages, timezone, canvasHash].join('||')
    // simple hash
    let h = 0
    for (let i = 0; i < raw.length; i++) h = (h << 5) - h + raw.charCodeAt(i) | 0
    return `fp_${Math.abs(h)}_${canvasHash}`
  } catch (e) {
    return 'fp_fallback'
  }
}

// TODO
function VerifyCodeModal({ open, onClose, api, verifyToken, onSuccess }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { if (open) { setCode(''); setError(null); setLoading(false) } }, [open, verifyToken])

  if (!open) return null

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      const body = JSON.stringify({ code, verifyToken })
      const res = await api('auth/verify', false, { method: 'POST', body })
      const data = await res.json()
      if (data.error) setError(data.error)
      else if (data.token) {
        onSuccess(data.token)
        onClose()
      } else {
        setError('Неизвестный ответ сервера')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Введите код из письма</h3>
        <p className="text-sm text-gray-600 mb-3">Мы отправили код на вашу почту. Если не пришёл — нажмите «Отправить код».</p>
        <input className="w-full border rounded px-3 py-2 mb-3" value={code} onChange={e => setCode(e.target.value)} placeholder="Код" />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex gap-2">
          <button onClick={submit} disabled={loading || !code} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
            {loading ? 'Проверка...' : 'Подтвердить'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded border">Отмена</button>
        </div>
      </div>
    </div>
  )
}

function QRScanner({ onScan }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [ error, setError ] = useState(null)
  const [ manual, setManual ] = useState(false)
  const [ nonce, setNonce ] = useState('')
  const [ activated, setActivated ] = useState(false)

  useEffect(() => {
    let mounted = true
    let stream
    let raf
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas && canvas.getContext && canvas.getContext('2d')

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (!mounted) return
        video.srcObject = stream
        video.setAttribute('playsinline', true)
        await video.play().catch(() => {})
        setActivated(true)

        const tick = async () => {
          if (!mounted) return
          if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            try {
              const imageData = ctx.getImageData(0,0,canvas.width,canvas.height)
              const code = window.jsQR && window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
              if (code) {
                const data = code.data.split('.')
                if (/0000/.test(data[0])) {
                  if (Number(data[2]) < Date.now() / 60000) alert('Код истёк')
                  else onScan({ nonce: data[1] })
                }
              }
            } catch (e) { /* ignore */ }
          }
          raf = requestAnimationFrame(tick)
        }
        tick()
      } catch (e) {
        setError('Камера недоступна')
      }
    }

    start()
    return () => {
      mounted = false
      if (raf) cancelAnimationFrame(raf)
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [ onScan ])

  return (
    <div className="flex flex-col items-center space-y-2">
      {!activated && !error && <p className="text-gray-700">Нажмите для активации камеры</p>}
      <video ref={videoRef} className="rounded shadow-md w-full max-w-sm" />
      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-red-600">{error}</p>}
      <p className="text-gray-700">Отсканируйте QR код группы</p>

      <div className="w-full max-w-sm flex flex-col items-center min-h-[90px] justify-center">
        {manual ? (
          <div className="flex flex-col w-full space-y-2">
            <input value={nonce} onChange={e => setNonce(e.target.value)} placeholder="Введите код вручную" className="border rounded px-3 py-2 w-full" />
            <button onClick={() => onScan({ nonce })} className="bg-blue-500 text-white rounded px-4 py-2">Активировать</button>
          </div>
        ) : (
          <button onClick={() => setManual(true)} className="text-blue-600 underline">Не работает сканер?</button>
        )}
      </div>
    </div>
  )
}

// Одновременно и для логина и для авторизации
function AuthForm({ api, group, onLogin, isRegister }) {
  const [ name, setName ] = useState('')
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ error, setError ] = useState(null)
  const [ loading, setLoading ] = useState(false)
  const [ verifyToken, setVerifyToken ] = useState(null)
  const [ verifyOpen, setVerifyOpen ] = useState(false)
  const [ fp, setFp ] = useState(null)

  useEffect(() => {
    let mounted = true
    getFingerprint().then(f => { if (mounted) setFp(f) }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleRegister = async (e) => {
    e && e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const body = JSON.stringify({ name, email, password, fingerprint: fp, groupId: group?.id })
      const res = await api('users', false, { method: 'POST', body, credentials: 'include' })
      const data = await res.json()
      if (data.error) {
        // handle specific server-side validation messages
        if (data.code === 'email_exists' || /email/.test(data.error.toLowerCase())) setError('Email уже используется')
        else if (data.code === 'password_too_weak' || /weak/.test(data.error.toLowerCase())) setError('Пароль слишком простой')
        else setError(data.error)
      } else if (data.verifyToken) {
        setVerifyToken(data.verifyToken)
        setVerifyOpen(true)
      } else if (data.token) {
        onLogin(data.token)
      } else {
        setError('Неизвестный ответ сервера')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e && e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const body = JSON.stringify({ email, password, fingerprint: fp })
      const res = await api('auth/login', false, { method: 'POST', body, credentials: 'include' })
      const data = await res.json()
      if (data.error) setError(data.error)
      else if (data.requireCode || data.verifyToken) {
        setVerifyToken(data.verifyToken || data.verifyToken === undefined ? data.verifyToken : null)
        setVerifyOpen(true)
      } else if (data.token) {
        onLogin(data.token)
      } else {
        setError('Неизвестный ответ сервера')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const sendCodeNow = async () => {
    // Send code immediately (without fingerprint verification) — per requirement
    if (!email) { setError('Введите email'); return }
    setLoading(true); setError(null)
    try {
      const body = JSON.stringify({ email })
      const res = await api('auth/send-code', false, { method: 'POST', body })
      const data = await res.json()
      if (data.error) setError(data.error)
      else if (data.verifyToken) { setVerifyToken(data.verifyToken); setVerifyOpen(true) }
      else setVerifyOpen(true)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white p-6 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">{isRegister ? 'Регистрация' : `Вход в группу ${group?.name || ''}`}</h2>

      {isRegister && (
        <label className="block mb-2">
          Имя
          <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
        </label>
      )}

      <label className="block mb-2">
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
      </label>

      <label className="block mb-4">
        Пароль
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
      </label>

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="flex gap-2 mb-3">
        <button onClick={isRegister ? handleRegister : handleLogin} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          {loading ? (isRegister ? 'Отправка...' : 'Входим...') : (isRegister ? 'Зарегистрироваться' : 'Войти')}
        </button>
        {!isRegister && (
          <button onClick={sendCodeNow} type="button" disabled={loading} className="px-3 py-2 rounded border">Отправить код</button>
        )}
      </div>

      <div className="text-sm text-gray-600">Ваш fingerprint: <span className="font-mono">{fp ? fp.slice(0,24) : '...генерируется'}</span></div>

      <VerifyCodeModal open={verifyOpen} onClose={() => setVerifyOpen(false)} api={api} verifyToken={verifyToken} onSuccess={onLogin} />
    </div>
  )
}

export default function AuthPage({ api, onLogin }) {
  const [ step, setStep ] = useState('start') // start | qr | login | register
  const [ group, setGroup ] = useState(null)
  const [ transition, setTransition ] = useState(false)

  const fadeToStep = (s) => {
    setTransition(true)
    setTimeout(() => { setStep(s); setTransition(false) }, 180)
  }

  const handleScan = async ({ nonce }) => {
    try {
      const res = await api(`invites/${nonce}/accept`, false, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (data.error) alert(data.error)
      else { setGroup(data.group); fadeToStep('register') }
    } catch (e) { console.error(e) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white p-6">
      <div className={`transition-opacity duration-200 ${transition ? 'opacity-0' : 'opacity-100'} w-full max-w-md`}> 
        {step === 'start' && (
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold">Приветствуем!</h2>
            <p className="text-sm text-gray-600 text-center">Отсканируйте приглашение в группу или войдите, если ранее уже создавали аккаунт</p>
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              <button className="bg-blue-600 text-white py-2 rounded" onClick={() => fadeToStep('qr')}>Сканировать QR</button>
              <button className="bg-green-600 text-white py-2 rounded" onClick={() => fadeToStep('login')}>Войти</button>
            </div>
          </div>
        )}

        {step === 'qr' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <QRScanner onScan={handleScan} />
            <div className="mt-4 flex justify-between">
              <button className="text-gray-600 underline" onClick={() => fadeToStep('start')}>Назад</button>
            </div>
          </div>
        )}

        {step === 'login' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <AuthForm api={api} group={group} onLogin={onLogin} isRegister={false} />
            <div className="mt-3 text-center">
            </div>
            <div className="mt-2 text-center">
              <button className="text-gray-600 underline" onClick={() => fadeToStep('start')}>Назад</button>
            </div>
          </div>
        )}

        {step === 'register' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <AuthForm api={api} group={group} onLogin={onLogin} isRegister={true} />
            <div className="mt-3 text-center">
              <button className="text-gray-600 underline" onClick={() => fadeToStep('login')}>Назад</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

