import { useEffect, useRef, useState } from "react"
import {
  Play, Pause, Volume2, VolumeX,
  Maximize, Minimize,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  // ZoomIn, ZoomOut
} from "lucide-react"

export default function VideoPlayer({ api, group, token, url, ptzEndpoint }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  const [ isPlaying, setIsPlaying ] = useState(false)
  const [ isMuted, setIsMuted ] = useState(true)
  const [ isFullscreen, setIsFullscreen ] = useState(false)
  const [ controlsVisible, setControlsVisible ] = useState(true)
  const [ latency, setLatency ] = useState(0)
  const [ isMobile, setIsMobile ] = useState(false)
  const [ isLoading, setIsLoading ] = useState(true)
  const [ autoplayBlocked, setAutoplayBlocked ] = useState(false)

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    if (!url) return
    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDuration: 1,
        liveMaxLatencyDuration: 7,
        maxLiveSyncPlaybackRate: 1.5,
        xhrSetup: (xhr) => {
          xhr.setRequestHeader("Authorization", "Bearer " + token)
        }
      })
      hls.loadSource(url + "/index.m3u8")
      hls.attachMedia(videoRef.current)
      hlsRef.current = hls
      return () => hls.destroy()
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = url + "/index.m3u8"
    }
  }, [url])

  useEffect(() => {
    if (!hlsRef.current) return
    hlsRef.current.config.xhrSetup = (xhr) => {
      xhr.setRequestHeader("Authorization", "Bearer " + token)
    }
  }, [token])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => {
        setAutoplayBlocked(true)
      })
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const toggleFullscreen = async () => {
    if (!videoRef.current) return
    if (!document.fullscreenElement) {
      await videoRef.current.parentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const sendPTZ = async (action) => {
    if (!ptzEndpoint) return
    try {
      await api(ptzEndpoint, true, {
        method: "POST",
        body: JSON.stringify({ groupId: group, action }),
      })
    } catch (e) {
      console.error("PTZ error", e)
    }
  }

  // play/pause events
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onPlay = () => {
      setIsPlaying(true)
      setAutoplayBlocked(false)
    }
    const onPause = () => setIsPlaying(false)
    const onPlaying = () => setIsLoading(false)
    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    v.addEventListener("playing", onPlaying)
    return () => {
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
      v.removeEventListener("playing", onPlaying)
    }
  }, [])
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setAutoplayBlocked(true)
      })
    }
  }, [])

  // controls auto-hide
  useEffect(() => {
    let hideTimer
    const showControls = () => {
      setControlsVisible(true)
      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => setControlsVisible(false), 3000)
    }
    const container = videoRef.current?.parentElement
    if (!container) return
    container.addEventListener("mousemove", showControls)
    container.addEventListener("click", showControls)
    return () => {
      container.removeEventListener("mousemove", showControls)
      container.removeEventListener("click", showControls)
      clearTimeout(hideTimer)
    }
  }, [])

  // latency calculation
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && hlsRef.current?.latency) {
        setLatency(hlsRef.current.latency.toFixed(1))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full bg-black rounded overflow-hidden">
      <video
        ref={videoRef}
        muted={isMuted}
        playsInline
        className="w-full h-full"
      />

      {/* loader or play button */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {autoplayBlocked ? (
            <button
              onClick={() => togglePlay()}
              className="text-white px-6 py-3 rounded-xl text-lg font-semibold"
            >
              Нажмите
            </button>
          ) : (
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          )}
        </div>
      )}

      {/* latency indicator */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
        Отставание {latency} сек
      </div>

      {/* controls */}
      <div className={`absolute bottom-2 left-2 right-2 flex items-center justify-between 
        bg-black/60 rounded-xl px-3 py-2 transition-opacity duration-500
        ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-white hover:text-green-400">
            {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
          </button>
          <button onClick={toggleMute} className="text-white hover:text-red-400">
            {isMuted ? <VolumeX size={24}/> : <Volume2 size={24}/>}
          </button>
        </div>
        <button onClick={toggleFullscreen} className="text-white hover:text-blue-400">
          {isFullscreen ? <Minimize size={24}/> : <Maximize size={24}/>}
        </button>
      </div>

      {/* PTZ panel */}
      {ptzEndpoint && (!isMobile || isFullscreen) && (
        <div className={`absolute top-2 right-2 grid grid-cols-3 gap-2 bg-black/50 p-2 rounded-xl
          transition-opacity duration-500 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div></div>
          <button onClick={() => sendPTZ("up")} className="text-white hover:text-green-400"><ArrowUp /></button>
          <div></div>

          <button onClick={() => sendPTZ("left")} className="text-white hover:text-green-400"><ArrowLeft /></button>
          <div></div>
          <button onClick={() => sendPTZ("right")} className="text-white hover:text-green-400"><ArrowRight /></button>

          <div></div>
          <button onClick={() => sendPTZ("down")} className="text-white hover:text-green-400"><ArrowDown /></button>
          <div></div>
        </div>
      )}
    </div>
  )
}

