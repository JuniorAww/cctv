import React, { useState, useEffect } from 'react'
import { Router } from 'preact-router'

import Dashboard from './pages/Dashboard'
import Participants from './pages/Participants'
import Recordings from './pages/Recordings'
import Cameras from './pages/Cameras'
import Settings from './pages/Settings'

import useAuth from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import styles from './styles'

export default function App() {
    const { getSession, api, token, logged, updateToken, logout } = useAuth();
    const [ stage, setStage ] = useState(null); // auth | main
    const [ group, setGroup ] = useState(null);
    const [ groups, setGroups ] = useState(null);
    const [ users, setUsers ] = useState(null);
    const [ sessions, setSessions ] = useState(null);
    const [ cameras, setCameras ] = useState([]);
    const [ currentPath, setCurrentPath ] = useState('/');
    const [ isMobile, setIsMobile ] = useState(window.innerWidth < 768);
    const [ isSidebarOpen, setSidebarOpen ] = useState(false);
    
    useEffect(() => {
        if (logged === undefined) return;
        if (!logged) {
            setStage('auth');
            removePreloader()
        } else {
            const init = async () => {
                try {
                    const response = await api('users/me?fields=groups,sessions', true);
                    if (!response.ok) throw new Error('Failed to fetch user data');
                    const { user } = await response.json();
                    const _groups = user.groups;
                    const _sessions = user.sessions;
                    
                    setGroups(_groups);
                    setSessions(_sessions);
                    
                    if (_groups && _groups.length > 0) {
                        setGroup(_groups[0]?.id);
                    } else {
                        console.warn('Нет доступных групп');
                        // Handle case with no groups, maybe show a message
                        setStage('main'); // Still go to main to show sidebar
                    }
                } catch (e) {
                    console.error("Auth Error:", e);
                    updateToken(null); // Clear invalid token
                    setStage('auth');
                }
            };
            console.log('logged, initializing')
            init();
        }
    }, [ logged ]);
    
    useEffect(() => {
        if (!group || !token || !logged) return;
        
        let isActive = true;

        const fetchGroup = async () => {
            try {
                const response = await api(`groups/${group}?fields=cameras,users`, true);
                 if (!response.ok) throw new Error('Failed to fetch group data');
                const { group: _group } = await response.json();
                if (isActive) {
                    setUsers(_group.users || []);
                    setCameras(_group.cameras || []);
                    if (stage !== 'main') setStage('main');
                }
            } catch (e) {
                console.error(e);
            } finally {
                removePreloader()
            }
        };

        fetchGroup();
        const interval = setInterval(fetchGroup, 60 * 1000);

        return () => {
            isActive = false;
            clearInterval(interval);
        };
    }, [ group, token, logged ]);
    
    const removePreloader = () => {
        const preloader = document.getElementById('preloader')
        if(preloader) preloader.remove()
    }
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onLogin = (data) => {
        updateToken(data);
        setStage(null);
    };

    const handleNavClick = (path) => {
        setCurrentPath(path);
        if (isMobile) setSidebarOpen(false);
    }
    
    const handleNavMouseEnter = (e) => !e.target.dataset.active && (e.target.style.backgroundColor = '#4a5568', e.target.style.color = '#fff');
    const handleNavMouseLeave = (e) => !e.target.dataset.active && (e.target.style.backgroundColor = 'transparent', e.target.style.color = '#a0aec0');
    
    const navLinks = [
        { href: '/', label: 'Сводка' }, { href: '/watch', label: 'Просмотр' }, { href: '/rewind', label: 'Записи' },
        { href: '/group', label: 'Участники' }, { href: '/settings', label: 'Настройки' },
    ];
    
    if (stage === null) {
        return (<>
          <div style={styles.background}></div>
          <div style={styles.authContainer}><h2 style={styles.h2}>Загрузка...</h2></div>
        </>);
    }
    
    if (stage === 'auth') {
        return (<>
          <div style={styles.background}></div>
          <AuthPage api={api} onLogin={onLogin} />
        </>);
    }
    
    const sidebarStyle = isMobile ? {...styles.sidebar, ...styles.sidebarMobile, ...(isSidebarOpen && styles.sidebarMobileOpen)} : styles.sidebar;
    
    const onGroupUserChange = newMember => {
        const _users = JSON.parse(JSON.stringify(users))
        const member = _users.find(x => x.id === newMember.id);
        member.name = newMember.name;
        if (newMember.avatar) member.avatar = newMember.avatar;
        setUsers(_users);
        
        const _groups = JSON.parse(JSON.stringify(groups))
        const _member = _groups.find(x => x.id === group).member
        _member.name = newMember.name;
        if (newMember.avatar) _member.avatar = newMember.avatar;
        setGroups(_groups);
    }
    
    return (
        <div style={styles.appContainer}>
            <div style={styles.background}></div>
            {isMobile && (
                <div
                    style={{
                        ...styles.overlay,
                        opacity: isSidebarOpen ? 1 : 0,
                        pointerEvents: isSidebarOpen ? 'auto' : 'none',
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <aside style={sidebarStyle}>
                <h1 style={styles.sidebarTitle}>CCTV System</h1>
                <nav>
                    {navLinks.map(link => (
                        <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                           style={{ ...styles.navLink, ...(currentPath === link.href && styles.navLinkActive) }}
                           onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave} data-active={currentPath === link.href}>
                            {link.label}
                        </a>
                    ))}
                </nav>
            </aside>

            <div style={{...styles.mainContent }}>
                <header style={isMobile ? {...styles.header, ...styles.headerMobile} : styles.header}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        {isMobile && (
                            <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={styles.hamburgerButton}>
                              <Hamburger/>
                            </button>
                        )}
                        <h2 style={styles.headerTitle}>{navLinks.find(l => l.href === currentPath)?.label}</h2>
                    </div>
                    {groups?.length > 0 && (
                        <select value={group || ''} onChange={e => setGroup(e.target.value)} style={styles.groupSelect}>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    )}
                </header>

                <main style={isMobile ? {...styles.pageContent, ...styles.pageContentMobile} : styles.pageContent}>
                    <div style={isMobile ? {...styles.pageWrapper, ...styles.pageWrapperMobile} : styles.pageWrapper}>
                        <Router onChange={e => setCurrentPath(e.url.split('?')[0])}>
                            <Dashboard path="/" users={users || []} cameras={cameras} />
                            <Cameras path="/watch" api={api} group={group} cameras={cameras} isMobile={isMobile} />
                            <Recordings path="/rewind" />
                            <Participants path="/group" users={users || []} />
                            <Settings path="/settings" api={api} _logout={logout} group={group} groups={groups} sessions={sessions}
                                      setSessions={setSessions} getSession={getSession} onGroupUserChange={onGroupUserChange} />
                        </Router>
                    </div>
                </main>
            </div>
        </div>
    );
}

function Hamburger() {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
  </svg>)
}
