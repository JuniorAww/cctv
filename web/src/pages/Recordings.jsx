
import styles from '../styles'

export default function Recordings() {
    return (
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
            <div style={{...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16" style={{marginBottom: '16px', color: '#a0aec0'}}>
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                </svg>
                <h3 style={{...styles.h3, marginBottom: '8px'}}>Функционал в разработке</h3>
                <p style={{color: '#a0aec0'}}>Здесь вы сможете просматривать архивные записи с ваших камер.</p>
            </div>
        </div>
    );
}
