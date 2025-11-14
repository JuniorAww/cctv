import React, { useState, useEffect, useRef , useMemo } from 'react'
import VideoPlayer from '../components/VideoPlayer'
import styles from '../styles'

export default function Cameras({ cameras, group, api, isMobile }) {
    const [ selectedCount, setSelectedCount ] = useState(1);
    const [ selectedCams, setSelectedCams ] = useState(cameras.length > 0 ? [ cameras[0].id ] : []);
    
    const toggleCam = (id) => {
      if (selectedCams.includes(id)) {
        setSelectedCams(selectedCams.filter((x) => x !== id))
      } else {
        /* На моб. устройствах нет сетки */
        if (isMobile || selectedCams.length < selectedCount) {
          setSelectedCams([ ...selectedCams, id ])
        }
        else {
          const cams = selectedCams
          cams.splice(0, 1)
          setSelectedCams([ ...cams, id ])
        }
      }
  }
    
    const gridLayout = useMemo(() => {
        if(selectedCams.length > selectedCount) setSelectedCams(selectedCams.slice(0, selectedCount))
        else {
            let diff = selectedCount - selectedCams.length;
            console.log(diff)
            const camIds = cameras.map(x => x.id)
            const addedCams = [];
            for (const camId of camIds) {
                if (diff < 1) break;
                if (selectedCams.find(x => x == camId)) continue;
                addedCams.push(camId)
                diff -= 1;
            }
            setSelectedCams([ ...selectedCams, ...addedCams ])
        }
        
        if (selectedCount === 1) return { ...styles.cameraGridBase, ...styles.grid1 };
        if (selectedCount === 2) return { ...styles.cameraGridBase, ...styles.grid2 };
        if (selectedCount === 4) return { ...styles.cameraGridBase, ...styles.grid4 };
        return { ...styles.cameraGridBase, ...styles.grid1 };
    }, [ selectedCount ]);

    return (
        <div>
            <div style={{ ...styles.card, marginBottom: '24px',  }}>
                {!isMobile && (
                    <div style={{ ...styles.flexColumnGap10, marginBottom: '24px' }}>
                        <h3 style={styles.h3}>Размер сетки</h3>
                        <div style={styles.cameraControls}>
                            {[1, 2, 4].map((count) => (
                                <button key={count} onClick={() => setSelectedCount(count)} style={{ ...styles.button, ...(selectedCount === count ? styles.buttonPrimary : styles.buttonSecondary) }}>
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div style={styles.flexColumnGap10}>
                    <h3 style={styles.h3}>
                        Камеры {isMobile ? "" : `(${selectedCams.length}/${selectedCount})`}
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
                <div style={{ ...styles.mobileCameraList, ...styles.flexColumnGap10 }}>
                    {selectedCams.map(id => {
                        const cam = cameras.find(c => c.id === id);
                        if (!cam) return null;
                        const source = cam.media?.find(x => x.type === 'hls');
                        const ptz = cam.media?.find(x => x.type === 'ptz') ? `cameras/${cam.id}/ptz` : null;
                        return (
                            <div key={id} style={styles.mobileCameraItem}>
                                <VideoPlayer api={api} ready={cam.ready} groupId={group} token={cam.token} url={source?.url} ptzEndpoint={ptz} isMobile={isMobile} />
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
                                <VideoPlayer api={api} ready={cam.ready} groupId={group} token={cam.token} url={source?.url} ptzEndpoint={ptz} isMobile={isMobile} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
