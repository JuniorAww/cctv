import { useEffect, useRef, useState } from "react"
import styles from '../styles'

export default function VideoPlayer({ api, group, token, url, ptzEndpoint }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [latency, setLatency] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
    
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!url || !videoRef.current || !token) return;
    // Assume HLS.js is loaded from a script tag in index.html
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        lowLatencyMode: true,
        liveSyncDuration: 1,
        liveMaxLatencyDuration: 7,
        maxLiveSyncPlaybackRate: 1.5,
        xhrSetup: (xhr) => xhr.setRequestHeader("Authorization", "Bearer " + token)
      });
      // Corrected the URL to include the manifest file, as in the original code
      hls.loadSource(url + "/index.m3u8"); 
      hls.attachMedia(videoRef.current);
      hlsRef.current = hls;
      return () => hls.destroy();
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = url + "/index.m3u8";
    }
  }, [url, token]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => setAutoplayBlocked(true));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = async () => {
    const parentElement = videoRef.current?.parentElement;
    if (!parentElement) return;
    if (!document.fullscreenElement) {
      await parentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      await document.exitFullscreen();
    }
  };

  const sendPTZ = async (action) => {
    if (!ptzEndpoint) return;
    try {
      await api(ptzEndpoint, true, {
        method: "POST",
        body: JSON.stringify({ groupId: group, action }),
      });
    } catch (e) {
      console.error("PTZ error", e);
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => { setIsPlaying(true); setAutoplayBlocked(false); setIsLoading(false); };
    const onPause = () => setIsPlaying(false);
    const onPlaying = () => setIsLoading(false); // Hide loader when playing starts
    const onWaiting = () => setIsLoading(true); // Show loader on buffer
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("waiting", onWaiting);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("waiting", onWaiting);
    };
  }, []);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setAutoplayBlocked(true);
        setIsLoading(true); // Keep loading state for the play button
      });
    }
  }, []);

  useEffect(() => {
    let hideTimer;
    const showControls = () => {
      setControlsVisible(true);
      clearTimeout(hideTimer);
      if (isPlaying) {
          hideTimer = setTimeout(() => setControlsVisible(false), 3000);
      }
    };
    const container = videoRef.current?.parentElement;
    if (!container) return;
    container.addEventListener("mousemove", showControls);
    container.addEventListener("mouseleave", () => clearTimeout(hideTimer));
    showControls(); // Show on mount
    return () => {
      container.removeEventListener("mousemove", showControls);
      container.removeEventListener("mouseleave", () => clearTimeout(hideTimer));
      clearTimeout(hideTimer);
    };
  }, [isPlaying]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && hlsRef.current?.latency) {
        setLatency(hlsRef.current.latency.toFixed(1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.videoPlayerContainer}>
      <video ref={videoRef} muted={isMuted} playsInline style={styles.videoElement} />

      {(isLoading || autoplayBlocked) && (
        <div style={styles.videoOverlay}>
          {autoplayBlocked ? (
            <button onClick={togglePlay} style={styles.videoPlayButton}>
              <PlayIcon />
            </button>
          ) : (
            <div style={styles.videoLoader} />
          )}
        </div>
      )}

      <div style={styles.videoLatency}>
        Задержка: {latency} сек
      </div>

      <div style={{...styles.videoControlsContainer, opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}>
        <div style={styles.videoControlsGroup}>
          <button onClick={togglePlay} style={styles.videoControlButton}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={toggleMute} style={styles.videoControlButton}>
            {isMuted ? <VolumeXIcon /> : <Volume2Icon />}
          </button>
        </div>
        <button onClick={toggleFullscreen} style={styles.videoControlButton}>
          {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        </button>
      </div>

      {ptzEndpoint && (!isMobile || isFullscreen) && (
        <div style={{ ...styles.videoPtzPanel, opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }}>
            <div style={{gridColumn: 2, gridRow: 1}}><button onClick={() => sendPTZ("up")} style={styles.videoControlButton}><ArrowUpIcon /></button></div>
            <div style={{gridColumn: 1, gridRow: 2}}><button onClick={() => sendPTZ("left")} style={styles.videoControlButton}><ArrowLeftIcon /></button></div>
            <div style={{gridColumn: 3, gridRow: 2}}><button onClick={() => sendPTZ("right")} style={styles.videoControlButton}><ArrowRightIcon /></button></div>
            <div style={{gridColumn: 2, gridRow: 3}}><button onClick={() => sendPTZ("down")} style={styles.videoControlButton}><ArrowDownIcon /></button></div>
        </div>
      )}
    </div>
  );
}

const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const Volume2Icon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>;
const VolumeXIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>;
const MaximizeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>;
const MinimizeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>;
const ArrowUpIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
const ArrowDownIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;
const ArrowLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const ArrowRightIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;




