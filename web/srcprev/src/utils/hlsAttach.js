export function attachHlsToVideo(video, url) {
  if (!video) return
  try {
    if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url
      return
    }
    // dynamic import so it's only loaded when needed
    import('hls.js').then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(()=>{}))
      } else {
        video.src = url
      }
    }).catch(() => {
      video.src = url
    })
  } catch (e) {
    video.src = url
  }
}
