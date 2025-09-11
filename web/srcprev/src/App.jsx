import React, { useEffect, useState } from 'react'
import useAuth from './hooks/useAuth'
import QrScanner from './components/QrScanner'
import AvatarEditor from './components/AvatarEditor'
import CameraGrid from './components/CameraGrid'
import PTZPanel from './components/PTZPanel'
import MicSender from './components/MicSender'

export default function App(){
  const { login, api, user, setUser } = useAuth()
  const [qrOpen, setQrOpen] = useState(false)
  const [qrToken, setQrToken] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [cameras, setCameras] = useState([])
  const [members, setMembers] = useState([])
  const [gridCount, setGridCount] = useState(4)
  const [activeCameras, setActiveCameras] = useState([])
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(()=>{
    fetch('/api/groups').then(r=>r.ok? r.json() : []).then(setGroups).catch(()=>setGroups([]))
  }, [])

  useEffect(()=>{
    if (!selectedGroup) return
    fetch(`/api/groups/${selectedGroup}/cameras`).then(r=>r.ok? r.json() : []).then(setCameras).catch(()=>setCameras([]))
    fetch(`/api/groups/${selectedGroup}/members`).then(r=>r.ok? r.json() : []).then(setMembers).catch(()=>setMembers([]))
  }, [selectedGroup])

  function onQrDetected(token){
    setQrToken(token)
    setQrOpen(false)
    alert('QR token received: ' + token + ' — теперь введи почту и пароль, нажми Register')
  }

  async function registerWithQr(){
    if (!qrToken) return alert('No QR token')
    const r = await fetch('/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ token: qrToken, email, password }) })
    if (!r.ok) return alert('register failed')
    // then login
    await login(email, password)
  }

  async function handleLogin(){
    try { await login(email, password) } catch (e) { alert('login failed') }
  }

  function toggleOpenCamera(camId){
    setActiveCameras(prev=>{
      if (prev.includes(camId)) return prev.filter(x=>x!==camId)
      if (prev.length >= gridCount) return [...prev.slice(1), camId]
      return [...prev, camId]
    })
  }

  async function addCamera(data){
    await api(`/api/groups/${selectedGroup}/cameras`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
    const res = await fetch(`/api/groups/${selectedGroup}/cameras`)
    const json = await res.json()
    setCameras(json)
  }

  async function uploadAvatar(blob){
    const fd = new FormData(); fd.append('avatar', blob, 'avatar.png')
    const r = await fetch('/api/users/me/avatar', { method: 'POST', body: fd })
    if (r.ok){ const j = await r.json(); setUser(j) }
    setShowAvatarEditor(false)
  }

  return (
    <div className="min-h-screen p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">CCTV Control</h1>
        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.avatarUrl} className="w-10 h-10 rounded" />
              <div className="text-sm">
                <div>{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <button className="px-3 py-1 bg-slate-200 rounded" onClick={()=>{ setShowAvatarEditor(true) }}>Edit avatar</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input className="border px-2 py-1" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
              <input className="border px-2 py-1" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleLogin}>Login</button>
              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>setQrOpen(true)}>Scan QR (register)</button>
            </div>
          )}
        </div>
      </header>

      <main className="grid grid-cols-4 gap-4">
        <aside className="col-span-1">
          <div className="bg-white p-3 rounded shadow">
            <h3 className="font-semibold">Groups</h3>
            <ul className="mt-2 space-y-2">
              {groups.map(g => (
                <li key={g.id} className={`p-2 rounded cursor-pointer ${selectedGroup===g.id ? 'bg-sky-100' : 'hover:bg-slate-50'}`} onClick={()=>setSelectedGroup(g.id)}>{g.name}</li>
              ))}
            </ul>

            <div className="mt-4">
              <h4 className="font-medium">Members</h4>
              <ul className="mt-2 space-y-2">
                {members.map(m => (
                  <li key={m.id} className="flex items-center gap-2">
                    <img src={m.avatarUrl} className="w-8 h-8 rounded" />
                    <div className="text-sm">
                      <div>{m.name}</div>
                      <div className="text-xs text-slate-500">{new Date(m.lastSeen || Date.now()).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <label className="text-sm">Grid</label>
              <div className="flex gap-2 mt-2">
                {[1,2,4].map(n => (
                  <button key={n} className={`px-2 py-1 rounded ${gridCount===n ? 'bg-sky-600 text-white' : 'bg-slate-100'}`} onClick={()=>setGridCount(n)}>{n}</button>
                ))}
              </div>
              <MicSender />
            </div>
          </div>

        </aside>

        <section className="col-span-3">
          <div className="bg-white p-3 rounded shadow mb-4">
            <h3 className="font-semibold">Cameras</h3>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {cameras.map(cam => (
                <div key={cam.id} className="p-2 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{cam.name}</div>
                      <div className="text-xs text-slate-500">{cam.id}</div>
                    </div>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 bg-slate-100 rounded text-xs" onClick={()=>toggleOpenCamera(cam.id)}>Open</button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Notes: {cam.notes || '-'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-3 rounded shadow">
            <h3 className="font-semibold">Live View</h3>
            <div className="mt-3">
              <CameraGrid cameras={cameras} activeCameras={activeCameras} gridCount={gridCount} />
            </div>
          </div>

          {activeCameras[0] && (
            <div className="mt-3">
              <PTZPanel cameraId={activeCameras[0]} />
            </div>
          )}

        </section>
      </main>

      {qrOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow w-[520px]">
            <h3 className="font-semibold">Scan QR</h3>
            <QrScanner onDetected={onQrDetected} onCancel={()=>setQrOpen(false)} />
            <div className="mt-3">
              <input className="border px-2 py-1" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
              <input className="border px-2 py-1 ml-2" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
              <button className="ml-2 px-3 py-1 bg-green-600 text-white rounded" onClick={registerWithQr}>Register</button>
            </div>
          </div>
        </div>
      )}

      {showAvatarEditor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow w-[520px]">
            <h3 className="font-semibold">Edit avatar</h3>
            <input type="file" accept="image/*" onChange={e=>setAvatarFile(e.target.files?.[0]||null)} />
            {avatarFile && <AvatarEditor file={avatarFile} onSave={uploadAvatar} onCancel={()=>setShowAvatarEditor(false)} />}
            <div className="mt-3"><button className="px-3 py-1 bg-slate-200 rounded" onClick={()=>setShowAvatarEditor(false)}>Close</button></div>
          </div>
        </div>
      )}

    </div>
  )
}
