import React, { useState, useRef } from 'react'
import styles from '../styles'

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);
const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
// ---

const mockServers = [
    { id: 'srv_main', name: 'Основной сервер' },
    { id: 'srv_archive_1', name: 'Архивный сервер' },
];

const mockAlarms = [
    { id: 'a1', timePercent: 25, type: 'Движение' },
    { id: 'a2', timePercent: 40, type: 'Пересечение линии' },
    { id: 'a3', timePercent: 75, type: 'Вход в зону' },
];

export default function Recordings({ cameras = [], api, isMobile }) {

    const [selectedCamera, setSelectedCamera] = useState(cameras.length > 0 ? cameras[0].id : '');
    const [selectedServer, setSelectedServer] = useState(mockServers[0].id);

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const [selectedDateTime, setSelectedDateTime] = useState(now.toISOString().slice(0, 16));

    const [recordingUrl, setRecordingUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    
    const videoRef = useRef(null);

    const handleLoadRecording = () => {
        setIsLoading(true);
        setRecordingUrl(null);
        setIsPlaying(false);
        setCurrentTime(0);

        console.log('Запрос на загрузку архива:', {
            camera: selectedCamera,
            server: selectedServer,
            time: selectedDateTime
        });

        // Имитация API-запроса
        setTimeout(() => {
            // const url = await fetch(`${api}/archive?cam=${selectedCamera}&server=${selectedServer}&time=${new Date(selectedDateTime).toISOString()}`);
            // setRecordingUrl(url.data.url);
            // setAlarms(url.data.alarms);
            setRecordingUrl('mock-url-from-mediamtx.mp4');
            setIsLoading(false);
        }, 1500);
    };

    const handleSaveClip = (seconds = 30) => {
        if (!recordingUrl) return;

        // const endTime = videoRef.current.currentTime;
        // const startTime = Math.max(0, endTime - seconds);
        
        console.log(`Запрос на сохранение клипа (последние ${seconds} сек)`);
        // await fetch(`${api}/archive/save`, {
        //     method: 'POST',
        //     body: JSON.stringify({ url: recordingUrl, startTime, endTime })
        // });
        alert(`Отправлен запрос на сохранение последних ${seconds} секунд.`);
    };

    const handleSeek = (e) => {
        const timePercent = e.target.value;
        setCurrentTime(timePercent);
        // const duration = videoRef.current.duration;
        // videoRef.current.currentTime = (duration * timePercent) / 100;
    };
    
    const formatTime = (timePercent) => {
        const totalSeconds = 3600; // Пример: 1 час
        const currentSeconds = Math.floor((totalSeconds * timePercent) / 100);
        const mins = Math.floor(currentSeconds / 60).toString().padStart(2, '0');
        const secs = (currentSeconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const localStyles = {
        select: {
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e0',
            backgroundColor: '#ffffff',
            minWidth: '100px',
            fontSize: '14px',
        },
        input: {
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e0',
            backgroundColor: '#ffffff',
            fontSize: '14px',
        },
        controlsContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'flex-end',
        },
        controlGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        },
        label: {
            fontWeight: '500',
            fontSize: '14px',
            color: '#4a5568',
        },
        playerWrapper: {
            ...styles.videoPlayerContainer,
            aspectRatio: '16 / 9',
        },
        timelineContainer: {
            position: 'relative',
            width: '100%',
            padding: '12px 0',
        },
        timelineSlider: {
            width: '100%',
            cursor: 'pointer',
        },
        alarmMarker: {
            position: 'absolute',
            bottom: '22px',
            width: '3px',
            height: '10px',
            backgroundColor: '#f56565',
            transform: 'translateX(-50%)',
        },
        playerControls: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginTop: '8px',
        },
        playerControlsGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        timeDisplay: {
            color: '#718096',
            fontSize: '14px',
            fontVariantNumeric: 'tabular-nums', // моноширинные цифры
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ ...styles.card, padding: '24px' }}>
                <h3 style={{ ...styles.h3, marginBottom: '20px' }}>В РАЗРАБОТКЕ! Просмотр архива</h3>
                
                <div style={{
                    ...localStyles.controlsContainer, 
                    ...(isMobile && { 
                        flexDirection: 'column', 
                        alignItems: 'stretch' 
                    }) 
                }}>
                    <div style={localStyles.controlGroup}>
                        <label style={localStyles.label}>Камера</label>
                        <select 
                            style={localStyles.select}
                            value={selectedCamera} 
                            onChange={(e) => setSelectedCamera(e.target.value)}
                        >
                            {cameras.map(cam => (
                                <option key={cam.id} value={cam.id}>{cam.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={localStyles.controlGroup}>
                        <label style={localStyles.label}>Сервер</label>
                        <select 
                            style={localStyles.select}
                            value={selectedServer}
                            onChange={(e) => setSelectedServer(e.target.value)}
                        >
                            {mockServers.map(srv => (
                                <option key={srv.id} value={srv.id}>{srv.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={localStyles.controlGroup}>
                        <label style={localStyles.label}>Дата и время</label>
                        <input 
                            type="datetime-local" 
                            style={localStyles.input}
                            value={selectedDateTime}
                            onChange={(e) => setSelectedDateTime(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleLoadRecording} 
                        style={{ 
                            ...styles.button, 
                            ...styles.buttonPrimary, 
                            minHeight: '38px',
                            ...(isMobile && { marginTop: '8px' })
                        }}
                        disabled={isLoading || !selectedCamera}
                    >
                        {isLoading ? 'Загрузка...' : 'Загрузить'}
                    </button>
                </div>
            </div>
            <div style={{ ...styles.card, padding: '24px' }}>
                <div style={localStyles.playerWrapper}>
                    {isLoading && (
                        <div style={styles.videoOverlay}><div style={styles.videoLoader} /></div>
                    )}
                    
                    {!isLoading && !recordingUrl && (
                        <div style={styles.videoOverlay}>
                            <p style={{ color: 'white', fontSize: '14px', textAlign: 'center', padding: '16px' }}>
                                Выберите камеру, сервер и время для просмотра архива
                            </p>
                        </div>
                    )}
                </div>
                <div style={{ marginTop: '16px', opacity: recordingUrl ? 1 : 0.4, pointerEvents: recordingUrl ? 'auto' : 'none' }}>
                    <div style={localStyles.timelineContainer}>
                        {mockAlarms.map(alarm => (
                            <div 
                                key={alarm.id}
                                title={alarm.type}
                                style={{ ...localStyles.alarmMarker, left: `${alarm.timePercent}%` }}
                            />
                        ))}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentTime}
                            onChange={handleSeek}
                            style={localStyles.timelineSlider}
                        />
                    </div>
                    <div style={{
                        ...localStyles.playerControls,
                        ...(isMobile && {
                            flexDirection: 'column',
                            gap: '16px',
                            alignItems: 'center'
                        })
                    }}>
                        <div style={localStyles.playerControlsGroup}>
                            <button 
                                onClick={() => setIsPlaying(!isPlaying)} 
                                style={{ ...styles.button, ...styles.buttonSecondary, padding: '8px' }}
                            >
                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                            <span style={localStyles.timeDisplay}>
                                {formatTime(currentTime)} / 01:00:00
                            </span>
                        </div>
                        <div style={localStyles.playerControlsGroup}>
                            <select 
                                style={{ ...localStyles.select, minWidth: '80px' }}
                                value={playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(e.target.value)}
                            >
                                <option value="0.5">0.5x</option>
                                <option value="1">1x</option>
                                <option value="2">2x</option>
                                <option value="4">4x</option>
                                <option value="8">8x</option>
                            </select>
                            <button 
                                onClick={() => handleSaveClip(30)}
                                title="Сохранить 30с"
                                style={{ ...styles.button, ...styles.buttonSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <DownloadIcon />
                                {!isMobile && ' Сохр. 30с'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
