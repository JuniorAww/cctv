const darkTheme = {
    // Layout
    appContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#1a202c', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' },
    sidebar: { width: '250px', backgroundColor: '#2d3748', padding: '24px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #4a5568', transition: 'transform 0.2s ease-in-out', zIndex: 100 },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s ease-in-out' },
    header: { padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #4a5568' },
    pageContent: { flex: 1, padding: '32px 0', overflowY: 'auto' },
    pageWrapper: { width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 32px', boxSizing: 'border-box' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 99, cursor: 'pointer', transition: 'opacity 0.2s ease-in-out' },
    
    // Mobile specific styles
    sidebarMobile: { position: 'fixed', height: '100%', transform: 'translateX(-100%)' },
    sidebarMobileOpen: { transform: 'translateX(0)', zIndex: 100 },
    mainContentMobile: { marginLeft: '0' },
    hamburgerButton: { background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', zIndex: 50 },
    pageContentMobile: { padding: '16px 0' },
    pageWrapperMobile: { padding: '0 16px' },
    headerMobile: { padding: '16px' },
    
    // Auth Page
    authContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)' },
    authCard: { backgroundColor: '#2d3748', padding: '32px', borderRadius: '16px', border: '1px solid #4a5568', width: '100%', maxWidth: '400px', transition: 'opacity 0.1s ease-in-out' },
    authTitle: { fontSize: '1.8rem', fontWeight: 'bold', textAlign: 'center', color: '#fff', margin: '0' },
    authSubtitle: { textAlign: 'center', color: '#a0aec0', marginBottom: '24px' },
    authButtonGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' },
    authError: { color: '#f56565', marginBottom: '16px', textAlign: 'center' },
    authLink: { background: 'none', border: 'none', color: '#4299e1', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
    fingerprintText: { fontSize: '0.8rem', color: '#718096', textAlign: 'center', marginTop: '16px', fontFamily: 'monospace' },
    
    // QR Scanner
    qrScannerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
    qrVideo: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', width: '100%', maxWidth: '400px' },
    qrError: { color: '#f56565' },
    qrText: { color: '#a0aec0' },

    // Verify Code Modal
    modalBackdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
    modalContent: { backgroundColor: '#2d3748', padding: '32px', borderRadius: '16px', border: '1px solid #4a5568', width: '100%', maxWidth: '400px' },
    modalActions: { display: 'flex', gap: '12px', marginTop: '16px' },

    // Components
    sidebarTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '32px' },
    navLink: { display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', color: '#a0aec0', marginBottom: '8px', transition: 'background-color 0.2s, color 0.2s' },
    navLinkActive: { backgroundColor: '#4299e1', color: '#fff' },
    headerTitle: { fontSize: '1.8rem', margin: '0 0 5px 0', fontWeight: 'bold' },
    groupSelect: { backgroundColor: '#4a5568', color: '#e2e8f0', border: '1px solid #718096', borderRadius: '8px', padding: '8px 12px', fontSize: '1rem', cursor: 'pointer' },
    card: { backgroundColor: '#2d3748', padding: '24px', borderRadius: '12px', border: '1px solid #4a5568' },
    h2: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#fff' },
    h3: { fontSize: '1.2rem', fontWeight: '600', margin: '0', color: '#fff' },
    button: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s, transform 0.1s' },
    buttonPrimary: { backgroundColor: '#4299e1', color: '#fff' },
    buttonSecondary: { backgroundColor: '#4a5568', color: '#e2e8f0' },
    buttonDanger: { backgroundColor: '#c53030', color: '#fff' },
    input: { display: 'flex', width: '100%', boxSizing: 'border-box', backgroundColor: '#1a202c', border: '1px solid #4a5568', borderRadius: '8px', padding: '12px', color: '#e2e8f0', fontSize: '1rem' },
    fileInput: { padding: '8px' },
    label: { display: 'block', marginBottom: '8px', color: '#a0aec0', fontWeight: '500' },
    flexColumnGap10: { display: 'flex', flexDirection: 'column', gap: '10px' },
    noDecor: { textDecoration: 'none' },
    
    // Dashboard
    dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    dashboardStatsGrid: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' },
    dashboardStatValue: { fontWeight: 'bold' },
    cameraListItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #4a5568' },
    cameraStatus: { display: 'flex', alignItems: 'center' },
    cameraStatusDot: { width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px' },
    
cameraGridBase: { display: 'grid', gap: '16px', width: '100%' },
    grid1: { gridTemplateColumns: '1fr' },
    grid2: { gridTemplateColumns: '1fr 1fr' },
    grid4: { gridTemplateColumns: '1fr 1fr' },
    cameraGridItem: { width: '100%', aspectRatio: '16 / 9' },
    cameraControls: { display: 'flex', gap: '12px' },
    cameraSelector: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
    mobileCameraList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    mobileCameraItem: { width: '100%', aspectRatio: '16 / 9' },

    // Video Player
    videoPlayerContainer: { position: 'relative', width: '100%', height: '100%', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', touchAction: 'none' },
    videoElement: { width: '100%', height: '100%', objectFit: 'contain', 
    transition: 'transform 0.05s ease-out' },
    videoOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: '10' },
    videoLoader: { width: '48px', height: '48px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    videoPlayButton: { background: 'rgba(0,0,0,0.5)', border: '2px solid white', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    videoLatency: { position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', zIndex: '20' },
    videoControlsContainer: { position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '12px', padding: '8px 12px', transition: 'opacity 0.3s', zIndex: '20' },
    videoControlsGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
    videoControlButton: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' },
    videoPtzPanel: { position: 'absolute', top: '8px', right: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gridTemplateRows: 'repeat(3, 32px)', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '12px', transition: 'opacity 0.3s', zIndex: '20' },
    
    
    // Participants
    participantList: { listStyle: 'none', padding: 0, margin: 0 },
    participantListItem: { display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #4a5568' },
    participantAvatarContainer: { width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', marginRight: '16px', backgroundColor: '#4a5568' },
    participantAvatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
    participantAvatarPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' },
    participantName: { fontWeight: '600', color: '#fff' },
    participantLastSeen: { color: '#a0aec0', fontSize: '0.9rem' },
    
    // Settings
    settingsTabs: { display: 'flex', gap: '16px', borderBottom: '1px solid #4a5568', marginBottom: '24px' },
    settingsTabButton: { padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: '600', borderBottom: '2px solid transparent' },
    settingsTabButtonActive: { color: '#4299e1', borderBottom: '2px solid #4299e1' },
    settingsTabButtonInactive: { color: '#a0aec0' },
    profileView: { display: 'flex', alignItems: 'center', gap: '24px' },
    profileAvatar: { width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#4a5568' },
    profileAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    profileAvatarPlaceholder: { fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' },
    profileName: { fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' },
    profileEditButton: { background: 'none', border: 'none', color: '#4299e1', cursor: 'pointer', padding: 0, textDecoration: 'underline' },
    formRow: { marginBottom: '16px' },
    formActions: { display: 'flex', gap: '12px' },
    sessionListItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0, borderBottom: '1px solid #4a5568' },
    sessionInfo: { fontWeight: '600', color: '#fff' },
    sessionMeta: { color: '#a0aec0', fontSize: '0.9rem' },
    sessionCurrentBadge: { color: '#48bb78', fontSize: '0.9rem' },
    
    // New stuff
    themeContainer: { display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    },
    themeButtonBase: { padding: '10px 18px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease-in-out',
    },
    themeButtonLight: { background: '#ffffff', color: '#333', border: '1px solid #ccc', },
    themeButtonDark: { background: '#1e1e1e', color: '#fff', border: '1px solid #444', },
};

/* yes */
const lightTheme = {
    appContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#fff7ed', color: '#4a2c06', fontFamily: 'Inter, sans-serif' },
    sidebar: { width: '250px', backgroundColor: '#ffedd5', padding: '24px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #fed7aa', transition: 'transform 0.3s ease-in-out', zIndex: 100 },
    mainContent: { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease-in-out' },
    header: { padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fed7aa', backgroundColor: '#fffaf0' },
    pageContent: { flex: 1, padding: '32px 0', overflowY: 'auto' },
    pageWrapper: { width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 32px', boxSizing: 'border-box' },

    // Mobile specific styles
    sidebarMobile: { position: 'fixed', height: '100%', transform: 'translateX(-100%)' },
    sidebarMobileOpen: { transform: 'translateX(0)' },
    mainContentMobile: { marginLeft: '0' },
    hamburgerButton: { background: 'none', border: 'none', color: '#b45309', cursor: 'pointer', zIndex: 50 },
    pageContentMobile: { padding: '16px 0' },
    pageWrapperMobile: { padding: '0 16px' },
    headerMobile: { padding: '16px' },

    // Auth Page
    authContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #ffedd5 0%, #fde68a 100%)' },
    authCard: { backgroundColor: '#fff7ed', padding: '32px', borderRadius: '16px', border: '1px solid #fed7aa', width: '100%', maxWidth: '400px', transition: 'opacity 0.1s ease-in-out' },
    authTitle: { fontSize: '1.8rem', fontWeight: 'bold', textAlign: 'center', color: '#7c2d12', margin: '0' },
    authSubtitle: { textAlign: 'center', color: '#b45309', marginBottom: '24px' },
    authButtonGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' },
    authError: { color: '#dc2626', marginBottom: '16px', textAlign: 'center' },
    authLink: { background: 'none', border: 'none', color: '#c2410c', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
    fingerprintText: { fontSize: '0.8rem', color: '#92400e', textAlign: 'center', marginTop: '16px', fontFamily: 'monospace' },

    // QR Scanner
    qrScannerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
    qrVideo: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '100%', maxWidth: '400px' },
    qrError: { color: '#dc2626' },
    qrText: { color: '#b45309' },

    // Verify Code Modal
    modalBackdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
    modalContent: { backgroundColor: '#fff7ed', padding: '32px', borderRadius: '16px', border: '1px solid #fed7aa', width: '100%', maxWidth: '400px' },
    modalActions: { display: 'flex', gap: '12px', marginTop: '16px' },

    // Components
    sidebarTitle: { fontSize: '1.5rem', fontWeight: 'bold', color: '#7c2d12', marginBottom: '32px', pointerEvents: 'none' },
    navLink: { display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', color: '#b45309', marginBottom: '8px', transition: 'background-color 0.2s, color 0.2s' },
    navLinkActive: { backgroundColor: '#f97316', color: '#fff' },
    headerTitle: { fontSize: '1.8rem', margin: '0 0 5px 0', fontWeight: 'bold', color: '#7c2d12' },
    groupSelect: { backgroundColor: '#ffedd5', color: '#7c2d12', border: '1px solid #fcd34d', borderRadius: '8px', padding: '8px 12px', fontSize: '1rem', cursor: 'pointer' },
    card: { backgroundColor: '#fffaf0', padding: '24px', borderRadius: '12px', border: '1px solid #fed7aa' },
    h2: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#7c2d12' },
    h3: { fontSize: '1.2rem', fontWeight: '600', margin: '0', color: '#7c2d12' },
    button: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s, transform 0.1s' },
    buttonPrimary: { backgroundColor: '#f97316', color: '#fff' },
    buttonSecondary: { backgroundColor: '#fdba74', color: '#7c2d12' },
    buttonDanger: { backgroundColor: '#dc2626', color: '#fff' },
    input: { width: '100%', boxSizing: 'border-box', backgroundColor: '#fffaf0', border: '1px solid #fed7aa', borderRadius: '8px', padding: '12px', color: '#7c2d12', fontSize: '1rem' },
    fileInput: { padding: '8px' },
    label: { display: 'block', marginBottom: '8px', color: '#b45309', fontWeight: '500' },
    flexColumnGap10: { display: 'flex', flexDirection: 'column', gap: '10px' },

    // Dashboard
    dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    dashboardStatsGrid: { display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' },
    dashboardStatValue: { fontWeight: 'bold', color: '#7c2d12' },
    cameraListItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #fed7aa' },
    cameraStatus: { display: 'flex', alignItems: 'center' },
    cameraStatusDot: { width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px', backgroundColor: '#f97316' },

    cameraGridBase: { display: 'grid', gap: '16px', width: '100%' },
    grid1: { gridTemplateColumns: '1fr' },
    grid2: { gridTemplateColumns: '1fr 1fr' },
    grid4: { gridTemplateColumns: '1fr 1fr' },
    cameraGridItem: { width: '100%', aspectRatio: '16 / 9' },
    cameraControls: { display: 'flex', gap: '12px' },
    cameraSelector: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
    mobileCameraList: { display: 'flex', flexDirection: 'column', gap: '16px' },
    mobileCameraItem: { width: '100%', aspectRatio: '16 / 9' },

    // Video Player
    videoPlayerContainer: { position: 'relative', width: '100%', height: '100%', backgroundColor: '#fff7ed', borderRadius: '8px', overflow: 'hidden', touchAction: 'none' },
    videoElement: { width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.05s ease-out' },
    videoOverlay: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,165,0,0.3)', zIndex: '10' },
    videoLoader: { width: '48px', height: '48px', border: '4px solid rgba(255,165,0,0.3)', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    videoPlayButton: { background: 'rgba(255,165,0,0.3)', border: '2px solid #7c2d12', color: '#7c2d12', cursor: 'pointer', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    videoLatency: { position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(255,165,0,0.3)', color: '#7c2d12', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', zIndex: '20' },
    videoControlsContainer: { position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,200,100,0.3)', borderRadius: '12px', padding: '8px 12px', transition: 'opacity 0.3s', zIndex: '20' },
    videoControlsGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
    videoControlButton: { background: 'none', border: 'none', color: '#7c2d12', cursor: 'pointer', padding: 0, display: 'flex' },
    videoPtzPanel: { position: 'absolute', top: '8px', right: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gridTemplateRows: 'repeat(3, 32px)', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: 'rgba(255,200,100,0.4)', padding: '8px', borderRadius: '12px', transition: 'opacity 0.3s', zIndex: '20' },

    // Participants
    participantList: { listStyle: 'none', padding: 0, margin: 0 },
    participantListItem: { display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #fed7aa' },
    participantAvatarContainer: { width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', marginRight: '16px', backgroundColor: '#fde68a' },
    participantAvatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
    participantAvatarPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c2d12', fontSize: '1.2rem', fontWeight: 'bold' },
    participantName: { fontWeight: '600', color: '#7c2d12' },
    participantLastSeen: { color: '#b45309', fontSize: '0.9rem' },

    // Settings
    settingsTabs: { display: 'flex', gap: '16px', borderBottom: '1px solid #fed7aa', marginBottom: '24px' },
    settingsTabButton: { padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: '600', borderBottom: '2px solid transparent' },
    settingsTabButtonActive: { color: '#f97316', borderBottom: '2px solid #f97316' },
    settingsTabButtonInactive: { color: '#b45309' },
    profileView: { display: 'flex', alignItems: 'center', gap: '24px' },
    profileAvatar: { width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#fde68a' },
    profileAvatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    profileAvatarPlaceholder: { fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#7c2d12' },
    profileName: { fontSize: '1.5rem', fontWeight: 'bold', color: '#7c2d12' },
    profileEditButton: { background: 'none', border: 'none', color: '#c2410c', cursor: 'pointer', padding: 0, textDecoration: 'underline' },
    formRow: { marginBottom: '16px' },
    formActions: { display: 'flex', gap: '12px' },
    sessionListItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #fed7aa' },
    sessionInfo: { fontWeight: '600', color: '#7c2d12' },
    sessionMeta: { color: '#b45309', fontSize: '0.9rem' },
    sessionCurrentBadge: { color: '#16a34a', fontSize: '0.9rem' },
}


const styles = { ...darkTheme };

styles.applyLight = () => {
    for (const style in lightTheme) {
        styles[style] = lightTheme[style]
    }
}

styles.applyDark = () => {
    for (const style in darkTheme) {
        styles[style] = lightTheme[style]
    }
}

export default styles;
