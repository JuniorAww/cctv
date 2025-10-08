import React, { useEffect, useRef, useState } from 'react'
import styles from '../styles'

async function getFingerprint() {
  try {
    const ua = navigator.userAgent || '' // not ukraine
    const platform = navigator.platform || ''
    const languages = navigator.languages ? navigator.languages.join(',') : navigator.language || ''
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    
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

export default function AuthPage({ api, onLogin }) {
    const [ step, setStep ] = useState('start'); // start | qr | login | register
    const [ group, setGroup ] = useState(null);
    const [ transition, setTransition ] = useState(false);

    const fadeToStep = (s) => {
        setTransition(true);
        setTimeout(() => { setStep(s); setTransition(false); }, 200);
    };

    const handleScan = async ({ nonce }) => {
        try {
            const res = await api(`invites/${nonce}/accept`, false, { method: 'POST', credentials: 'include' });
            const data = await res.json();
            if (data.error) alert(data.error);
            else { setGroup(data.group); fadeToStep('register'); }
        } catch (e) { console.error(e); }
    };
    
    const renderContent = () => {
        switch(step) {
            case 'start':
                return (
                    <>
                        <h2 style={styles.authTitle}>Приветствуем!</h2>
                        <p style={styles.authSubtitle}>Отсканируйте приглашение или войдите в аккаунт.</p>
                        <div style={styles.authButtonGrid}>
                            <button style={{...styles.button, ...styles.buttonPrimary}} onClick={() => fadeToStep('qr')}>Сканировать QR</button>
                            <button style={{...styles.button, ...styles.buttonSecondary}} onClick={() => fadeToStep('login')}>Войти</button>
                        </div>
                    </>
                );
            case 'qr':
                return (
                    <>
                         <QRScanner onScan={handleScan} />
                         <div style={{marginTop: '16px'}}>
                            <button style={styles.authLink} onClick={() => fadeToStep('start')}>Назад</button>
                         </div>
                    </>
                );
            case 'login':
            case 'register':
                return (
                    <>
                        <AuthForm api={api} group={group} onLogin={onLogin} isRegister={step === 'register'} />
                        <div style={{marginTop: '16px', textAlign: 'center'}}>
                           <button style={styles.authLink} onClick={() => fadeToStep(step === 'login' ? 'start' : 'login')}>Назад</button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <div style={styles.authContainer}>
            <div style={{ ...styles.authCard, opacity: transition ? 0 : 1 }}>
                {renderContent()}
            </div>
        </div>
    );
}

function AuthForm({ api, group, onLogin, isRegister }) {
    const [ name, setName ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState(null);
    const [ loading, setLoading ] = useState(false);
    const [ verifyToken, setVerifyToken ] = useState(null);
    const [ verifyOpen, setVerifyOpen ] = useState(false);
    const [ fp, setFp ] = useState(null);

    useEffect(() => {
        let mounted = true;
        getFingerprint().then(f => { if (mounted) setFp(f); }).catch(() => {});
        return () => { mounted = false; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            const endpoint = isRegister ? 'users' : 'auth/login';
            const body = isRegister ? 
                { name, email, password, fingerprint: fp, groupId: group?.id } : 
                { email, password, fingerprint: fp };
            
            const res = await api(endpoint, false, { method: 'POST', body: JSON.stringify(body), credentials: 'include' });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else if (data.verifyToken) {
                setVerifyToken(data.verifyToken);
                setVerifyOpen(true);
            } else if (data.token) {
                onLogin(data);
            } else {
                 setError('Произошла ошибка. Попробуйте снова.');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
         <>
            <form onSubmit={handleSubmit}>
                <h2 style={styles.authTitle}>{isRegister ? 'Регистрация' : 'Вход в группу'}</h2>
                <p style={styles.authSubtitle}>{isRegister && group ? `для присоединения к "${group.name}"` : ' '}</p>
                {isRegister && (
                    <div style={styles.formRow}>
                        <label style={styles.label}>Имя</label>
                        <input value={name} onChange={e => setName(e.target.value)} style={styles.input} required />
                    </div>
                )}
                 <div style={styles.formRow}>
                    <label style={styles.label}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
                </div>
                 <div style={styles.formRow}>
                    <label style={styles.label}>Пароль</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
                </div>
                {error && <p style={styles.authError}>{error}</p>}
                <button type="submit" disabled={loading} style={{...styles.button, ...styles.buttonPrimary, width: '100%', marginTop: '8px'}}>
                    {loading ? 'Загрузка...' : (isRegister ? 'Зарегистрироваться' : 'Войти')}
                </button>
                <p style={styles.fingerprintText}>{fp ? fp.slice(0, 32) : '...генерируется'}</p>
            </form>
            <VerifyCodeModal open={verifyOpen} onClose={() => setVerifyOpen(false)} api={api} verifyToken={verifyToken} onSuccess={onLogin} />
        </>
    );
}

function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [manual, setManual] = useState(false);
  const [nonce, setNonce] = useState('');
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    // <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>
    if (!window.jsQR) {
        setError("Библиотека jsQR не загрузилась!");
        return;
    }

    let mounted = true;
    let stream;
    let raf;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext && canvas.getContext('2d');

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!mounted) return;
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        await video.play().catch(() => {});
        setActivated(true);

        const tick = async () => {
          if (!mounted) return;
          if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            try {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
              if (code) {
                onScan({ nonce: code.data }); // Simplified scan handler
              }
            } catch (e) { /* ignore */ }
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        setError('Камера недоступна');
      }
    }

    start();
    return () => {
      mounted = false;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [onScan]);

  return (
    <div style={styles.qrScannerContainer}>
      {!activated && !error && <p style={styles.qrText}>Активация камеры...</p>}
      <video ref={videoRef} style={styles.qrVideo} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {error && <p style={styles.qrError}>{error}</p>}
      <p style={styles.qrText}>Отсканируйте QR код группы</p>
      
      {manual ? (
          <div style={{width: '100%'}}>
            <input value={nonce} onChange={e => setNonce(e.target.value)} placeholder="Введите код вручную" style={{...styles.input, marginBottom: '8px'}} />
            <button onClick={() => onScan({ nonce })} style={{...styles.button, ...styles.buttonPrimary, width: '100%'}}>Активировать</button>
          </div>
      ) : (
          <button onClick={() => setManual(true)} style={styles.authLink}>Ввести код вручную</button>
      )}
    </div>
  );
}

function VerifyCodeModal({ open, onClose, api, verifyToken, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { if (open) { setCode(''); setError(null); setLoading(false); } }, [open, verifyToken]);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const body = JSON.stringify({ code, verifyToken });
      const res = await api('auth/verify', false, { method: 'POST', body, credentials: 'include' });
      const data = await res.json();
      if (data.error) setError(data.error);
      else if (data.token) {
        onSuccess(data.token);
        onClose();
      } else {
        setError('Неизвестный ответ сервера');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        <h3 style={styles.authTitle}>Введите код</h3>
        <p style={styles.authSubtitle}>Мы отправили код подтверждения на вашу почту.</p>
        <div style={styles.formRow}>
             <input style={styles.input} value={code} onChange={e => setCode(e.target.value)} placeholder="Код из письма" />
        </div>
        {error && <p style={styles.authError}>{error}</p>}
        <div style={styles.modalActions}>
          <button onClick={submit} disabled={loading || !code} style={{...styles.button, ...styles.buttonPrimary, flex: 1}}>
            {loading ? 'Проверка...' : 'Подтвердить'}
          </button>
          <button onClick={onClose} style={{...styles.button, ...styles.buttonSecondary}}>Отмена</button>
        </div>
      </div>
    </div>
  );
}
