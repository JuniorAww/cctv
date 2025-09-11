import React, { useEffect, useRef } from 'react'
import { attachHlsToVideo } from '../utils/hlsAttach'

export default function CameraGrid({ cameras, activeCameras, gridCount }){
  const refs = useRef({})

  useEffect(()=>{
    activeCameras.forEach(id => {
      const cam = cameras.find(c=>c.id === id)
      if (!cam) return
      const video = refs.current[id]
      if (!video) return
      attachHlsToVideo(video, cam.hlsUrl || cam.url)
    })
  }, [activeCameras, cameras])

  const slots = Array.from({ length: gridCount })
  return (
    <div className={`grid grid-cols-${gridCount} gap-2`}>
      {slots.map((_,i)=>{
        const camId = activeCameras[i]
        const cam = cameras.find(c=>c.id === camId)
        return (
          <div key={i} className="bg-black rounded overflow-hidden relative aspect-video">
            {cam ? (
              <video ref={el => (refs.current[cam.id] = el)} controls autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">No camera</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
