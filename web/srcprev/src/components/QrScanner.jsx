import React, { useRef, useEffect } from 'react'
import jsQR from 'jsqr'

export default function QrScanner({ onDetected, onCancel }){
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(()=>{
    let running = true
    let raf = null
    let stream

    async function start(){
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        const ctx = canvasRef.current.getContext('2d')

        function tick(){
          if (!running) return
          const v = videoRef.current
          if (v && v.readyState === v.HAVE_ENOUGH_DATA) {
            canvasRef.current.width = v.videoWidth
            canvasRef.current.height = v.videoHeight
            ctx.drawImage(v, 0, 0)
            const img = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
            const code = jsQR(img.data, img.width, img.height)
            if (code) {
              running = false
              onDetected(code.data)
              stream.getTracks().forEach(t=>t.stop())
              return
            }
          }
          raf = requestAnimationFrame(tick)
        }
        tick()
      } catch (e) {
        console.error('QR start failed', e)
      }
    }

    start()
    return ()=>{ running=false; if (raf) cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(t=>t.stop()) }
  },[])

  return (
    <div className="w-full">
      <video ref={videoRef} className="w-full rounded" muted playsInline />
      <canvas ref={canvasRef} style={{display:'none'}} />
      <div className="mt-2 flex justify-end">
        <button className="px-3 py-1 bg-slate-200 rounded" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
