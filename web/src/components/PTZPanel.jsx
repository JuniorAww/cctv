import React, { useEffect, useRef } from 'react'

export default function PTZPanel({ cameraId }){
  const wsRef = useRef(null)

  useEffect(()=>{
    try {
      wsRef.current = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host.replace(/:\d+/, ':3002') + '/ws/ptz')
      wsRef.current.onopen = ()=>{}
      wsRef.current.onmessage = e => { console.log('ptz ws', e.data) }
    } catch (e) { console.warn('PTZ ws failed', e) }
    return ()=>{ if (wsRef.current) wsRef.current.close() }
  }, [])

  function send(cmd){
    // POST
    fetch(`/api/cameras/${cameraId}/ptz`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ command: cmd }) }).catch(console.error)
    // WS
    try { wsRef.current && wsRef.current.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify({ cameraId, command: cmd })) } catch(e){}
  }

  return (
    <div className="p-2 bg-white rounded shadow mt-2">
      <div className="flex gap-2 justify-center">
        <button className="px-3 py-1 bg-slate-200 rounded" onClick={()=>send('up')}>▲</button>
      </div>
      <div className="flex gap-2 justify-center mt-2">
        <button className="px-3 py-1 bg-slate-200 rounded" onClick={()=>send('left')}>◀</button>
        <button className="px-3 py-1 bg-slate-200 rounded" onClick={()=>send('right')}>▶</button>
      </div>
      <div className="flex gap-2 justify-center mt-2">
        <button className="px-3 py-1 bg-slate-200 rounded" onClick={()=>send('down')}>▼</button>
      </div>
      <div className="flex gap-2 justify-center mt-3">
        <button className="px-3 py-1 bg-slate-200 rounded" onClick={()=>send('zoom_in')}>Zoom +</button>
        <button className="px-3 py-1 bg-slate-200 rounded" onClick={()=>send('zoom_out')}>Zoom −</button>
      </div>
    </div>
  )
}
