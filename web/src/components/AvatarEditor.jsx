import React, { useRef, useEffect, useState } from 'react'

export default function AvatarEditor({ file, onSave, onCancel }){
  const canvasRef = useRef(null)
  const [img, setImg] = useState(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x:0, y:0 })

  useEffect(()=>{
    if (!file) return
    const url = URL.createObjectURL(file)
    const i = new Image()
    i.onload = ()=>{ setImg(i); draw(i) }
    i.src = url
    return ()=> URL.revokeObjectURL(url)
  }, [file])

  function draw(image){
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    const size = 256
    c.width = size; c.height = size
    ctx.fillStyle = '#ddd'
    ctx.fillRect(0,0,size,size)
    const iw = image.width * scale
    const ih = image.height * scale
    const x = (size - iw)/2 + offset.x
    const y = (size - ih)/2 + offset.y
    ctx.drawImage(image, x, y, iw, ih)
  }

  useEffect(()=>{ if (img) draw(img) }, [scale, offset])

  function save(){
    canvasRef.current.toBlob(b => onSave(b))
  }

  return (
    <div className="p-4">
      <canvas ref={canvasRef} className="border rounded" />
      <div className="mt-3 flex items-center gap-2">
        <input type="range" min="0.5" max="3" step="0.01" value={scale} onChange={e=>setScale(Number(e.target.value))} />
        <div className="flex gap-1">
          <button className="px-2 py-1 bg-slate-200 rounded" onClick={()=>setOffset(o=>({x:o.x-10,y:o.y}))}>◀</button>
          <button className="px-2 py-1 bg-slate-200 rounded" onClick={()=>setOffset(o=>({x:o.x+10,y:o.y}))}>▶</button>
          <button className="px-2 py-1 bg-slate-200 rounded" onClick={()=>setOffset(o=>({x:o.x,y:o.y-10}))}>▲</button>
          <button className="px-2 py-1 bg-slate-200 rounded" onClick={()=>setOffset(o=>({x:o.x,y:o.y+10}))}>▼</button>
        </div>
        <button className="ml-auto px-3 py-1 bg-green-600 text-white rounded" onClick={save}>Save</button>
        <button className="px-3 py-1 bg-slate-200 rounded" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
