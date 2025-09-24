import React, { useState, useEffect, useRef , useMemo } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import styles from '../styles'

export default function Cameras({ cameras, group, api, isMobile }) {
    const [selectedCount, setSelectedCount] = useState(1);
    const [selectedCams, setSelectedCams] = useState(cameras.length > 0 ? [cameras[0].id] : []);
    
    useEffect(() => {
        setSelectedCams(cameras.length > 0 ? [cameras[0].id] : []);
    }, [cameras]);

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
    
    const gridLayout = useMemo(() => {
        if (selectedCount === 1) return { ...styles.cameraGridBase, ...styles.grid1 };
        if (selectedCount === 2) return { ...styles.cameraGridBase, ...styles.grid2 };
        if (selectedCount === 4) return { ...styles.cameraGridBase, ...styles.grid4 };
        return { ...styles.cameraGridBase, ...styles.grid1 };
    }, [selectedCount]);

    return (
        <div>
            <div style={{ ...styles.card, marginBottom: '24px' }}>
                {!isMobile && (
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={styles.h3}>Сетка</h3>
                        <div style={styles.cameraControls}>
                            {[1, 2, 4].map((count) => (
                                <button key={count} onClick={() => setSelectedCount(count)} style={{ ...styles.button, ...(selectedCount === count ? styles.buttonPrimary : styles.buttonSecondary) }}>
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <h3 style={styles.h3}>
                        Выберите камеры {isMobile ? `(${selectedCams.length})` : `(${selectedCams.length}/${selectedCount})`}
                    </h3>
                    <div style={styles.cameraSelector}>
                        {(cameras || []).map(({ id, name }) => (
                            <button key={id} onClick={() => toggleCam(id)} style={{ ...styles.button, ...(selectedCams.includes(id) ? styles.buttonPrimary : styles.buttonSecondary) }}>
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isMobile ? (
                <div style={styles.mobileCameraList}>
                    {selectedCams.map(id => {
                        const cam = cameras.find(c => c.id === id);
                        if (!cam) return null;
                        const source = cam.media?.find(x => x.type === 'hls');
                        const ptz = cam.media?.find(x => x.type === 'ptz') ? `cameras/${cam.id}/ptz` : null;
                        return (
                            <div key={id} style={styles.mobileCameraItem}>
                                <VideoPlayer api={api} group={group} token={cam.token} url={source?.url} ptzEndpoint={ptz} />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={gridLayout}>
                    {selectedCams.map(id => {
                        const cam = cameras.find(c => c.id === id);
                        if (!cam) return null;
                        const source = cam.media?.find(x => x.type === 'hls');
                        const ptz = cam.media?.find(x => x.type === 'ptz') ? `cameras/${cam.id}/ptz` : null;
                        return (
                           <div key={id} style={styles.cameraGridItem}>
                                <VideoPlayer api={api} group={group} token={cam.token} url={source?.url} ptzEndpoint={ptz} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
