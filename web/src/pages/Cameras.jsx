import React, { useState, useEffect, useRef } from 'react'
import VideoPlayer from '../components/VideoPlayer'

export default function Cameras({ cameras, group, api }) {
  const [ selectedCount, setSelectedCount ] = useState(1)
  const [ selectedCams, setSelectedCams ] = useState([cameras[0]?.id])
  const [ quality, setQuality ] = useState(null) // TODO ?

  const toggleCam = (id) => {
    if (selectedCams.includes(id)) {
      setSelectedCams(selectedCams.filter((x) => x !== id))
    } else {
      if (selectedCams.length < selectedCount) {
        setSelectedCams([...selectedCams, id])
      }
      else {
        const cams = selectedCams
        cams.splice(0, 1)
        setSelectedCams([...cams, id])
      }
    }
  }

  React.useEffect(() => {
    if (selectedCams.length > selectedCount) {
      setSelectedCams(selectedCams.slice(0, selectedCount));
    } else if (selectedCams.length < selectedCount) {
      const newCams = [...selectedCams];
      for (const camera of cameras) {
        if (newCams.length >= selectedCount) break;
        if (!newCams.includes(camera.id)) {
          newCams.push(camera.id);
        }
      }
      setSelectedCams(newCams);
    }
  }, [selectedCount, cameras]);

  // CSS grid для камер
  const gridClass =
    selectedCount === 4
      ? 'grid grid-cols-2 grid-rows-2 gap-2 h-[400px]'
      : selectedCount === 2
      ? 'grid grid-cols-2 gap-2 h-[300px]'
      : 'h-[300px]'

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Выберите количество камер</h2>
      <div className="mb-4 flex space-x-3">
        {[1, 2, 4].map((count) => (
          <button
            key={count}
            onClick={() => setSelectedCount(count)}
            className={`px-4 py-2 rounded border ${
              selectedCount === count ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
            }`}
          >
            {count}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Выберите камеры</h3>
        <div className="flex flex-wrap gap-2 max-w-md">
          {cameras.map(({ id, name }) => (
            <button
              key={id}
              onClick={() => toggleCam(id)}
              className={`px-3 py-1 rounded border ${
                selectedCams.includes(id) ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full max-w-5xl mx-auto aspect-video">
  <div
    className={`absolute inset-0 ${
      selectedCount === 4
        ? 'grid grid-cols-2 grid-rows-2 gap-2'
        : selectedCount === 2
        ? 'grid grid-cols-2 gap-2'
        : 'flex'
    }`}
  >
    {!cameras.length ? "" : selectedCams.map((id) => {
      const cam = cameras.find((c) => c.id === id)
      const source = cam.media.find(x => x.type === 'hls')
      console.log('Source', source)
      const ptz = cam.media.find(x => x.type === 'ptz')
                  ? "cameras/" + cam.id + "/ptz" : null
      return (
        <div key={id} className="w-full h-full">
          <VideoPlayer api={api} group={group} token={cam.token} url={source.url} ptzEndpoint={ptz} />
        </div>
      )
    })}
  </div>
</div>
    </div>
  )
}
