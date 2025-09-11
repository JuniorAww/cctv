import React, { useRef, useState } from 'react'

export default function MicSender(){
  const wsRef = useRef(null)
  const ctxRef = useRef(null)
  const procRef = useRef(null)
  const [running, setRunning] = useState(false)

  async function start(){
    try {
      wsRef.current = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host.replace(/:\d+/, ':3002') + '/ws/audio')
      wsRef.current.binaryType = 'arraybuffer'
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ctxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const proc = ctx.createScriptProcessor(4096, 1, 1)
      proc.onaudioprocess = (e) => {
        const ch = e.inputBuffer.getChannelData(0)
        // convert float32 to int16
        const buf = new ArrayBuffer(ch.length * 2)
        const dv = new DataView(buf)
        for (let i=0;i<ch.length;i++){ const s = Math.max(-1, Math.min(1, ch[i])); dv.setInt16(i*2, s<0 ? s*0x8000 : s*0x7fff, true) }
        try { if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) wsRef.current.send(buf) } catch(e){}
      }
      src.connect(proc)
      proc.connect(ctx.destination)
      procRef.current = proc
      setRunning(true)
    } catch (e) { console.error('mic start failed', e) }
  }

  function stop(){
    if (procRef.current) { procRef.current.disconnect(); procRef.current = null }
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    setRunning(false)
  }

  return (
    <div className="mt-2">
      {running ? (
        <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={stop}>Stop mic</button>
      ) : (
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={start}>Start mic (send via WS)</button>
      )}
    </div>
  )
}
