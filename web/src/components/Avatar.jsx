import { useState } from 'react'
import styles from '../styles'

export default function Avatar({ src, alt }) {
  const [ loaded, setLoaded ] = useState(false);

  return (
    <div style={ styles.participantAvatarImage }>
      {!loaded && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...styles.participantAvatarPlaceholder,
          }}
        >
        <div class="spinner" style="
            width: 20px;
            height: 20px;
            border: 4px solid #ccc;
            border-top-color: rgb(226, 232, 240);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          display: loaded ? "block" : "none",
          ...styles.participantAvatarImage
        }}
      />
    </div>
  );
}
