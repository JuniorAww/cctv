import React, { useState, useMemo } from 'react'
import Avatar from '../components/Avatar'
import TimeAgo from '../utils/timeAgo'
import styles from '../styles'

export default function Settings({ api, _logout, groups, group, sessions, setSessions, getSession, onGroupUserChange }) {
  const groupData = useMemo(() => groups.find(x => x.id === group), [ groups, group ])
  if (!groupData.member) alert("Ошибка получения данных!")
  
  const [ name, setName ] = useState(groupData.member.name)
  const [ avatar, setAvatar ] = useState(groupData.member?.avatar || null)
  const [ activeTab, setActiveTab ] = useState('profile');
  const [ isEditing, setEditing ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);

  const onSave = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Смена имени
      const resName = await api(`/groups/${group}/member`, true, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!resName.ok) throw new Error('Не удалось сменить имя')

      // 2. Загрузка аватара (если есть)
      let avatarUrl = avatar
      
      if (avatar && avatar.startsWith('data:image')) {
        const blob = await (await fetch(avatar)).blob()
        const form = new FormData()
        form.append('avatar', blob, 'avatar.jpeg')
        const resAvatar = await api(`/groups/${group}/member/avatar`, true, {
          method: 'PATCH',
          body: form
        })
        if (!resAvatar.ok) throw new Error('Не удалось загрузить аватар')
        const data = await resAvatar.json()
        avatarUrl = data.url
      }

      onGroupUserChange({ ...groupData.member, name, avatar: avatarUrl })
      setEditing(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      const MAX_DIM = 512
      let w = img.naturalWidth
      let h = img.naturalHeight

      if (w > h && w > MAX_DIM) { h = (h / w) * MAX_DIM; w = MAX_DIM }
      else if (h >= w && h > MAX_DIM) { w = (w / h) * MAX_DIM; h = MAX_DIM }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      
      ctx.drawImage(img, 0, 0, w, h)
      
      const data = ctx.getImageData(Math.floor(w/2), Math.floor(h/2), 1, 1).data
      if (data.every(v => v === 0)) console.error('Canvas пустой!')
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setAvatar(dataUrl)
    }

      img.onerror = () => console.error('Не удалось загрузить изображение')
  }
  
  const disableSession = async session => {
    const response = await api(`sessions/${session.id}`, true, {
      method: 'DELETE',
    })
    const { success, error } = await response.json()
    
    if (success) {
        setSessions([...sessions].filter(s => s.id !== session.id))
    }
    else alert(error)
  }
  
  const logout = async session => {
    const response = await api(`sessions/${session.id}`, true, {
      method: 'DELETE',
    })
    const { success, error } = await response.json()
    
    if (success) {
        _logout()
        window.reload()
    }
    else alert(error)
  }
  
  const currentSession = useMemo(() => getSession()?.current, []);

    return (
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
            <div style={styles.settingsTabs}>
                <button onClick={() => setActiveTab('profile')} style={{...styles.settingsTabButton, ...(activeTab === 'profile' ? styles.settingsTabButtonActive : styles.settingsTabButtonInactive)}}>Профиль</button>
                <button onClick={() => setActiveTab('sessions')} style={{...styles.settingsTabButton, ...(activeTab === 'sessions' ? styles.settingsTabButtonActive : styles.settingsTabButtonInactive)}}>Сессии</button>
                {/*<button onClick={() => setActiveTab('settings')} style={{...styles.settingsTabButton, ...(activeTab === 'settings' ? styles.settingsTabButtonActive : styles.settingsTabButtonInactive)}}>Внешний вид</button>*/}
            </div>
            <div style={styles.card}>
                {activeTab === 'profile' ? (
                    isEditing ? (
                        <ProfileTab 
                            name={name}
                            setName={setName}
                            avatar={avatar}
                            setAvatar={setAvatar}
                            onFileChange={onFileChange}
                            onSave={onSave}
                            setEditing={setEditing}
                        />
                    ) : (
                        <ProfileView 
                            name={name}
                            avatar={avatar}
                            setEditing={setEditing}
                        />
                    )
                ) : activeTab === 'sessions' ? (
                    <SessionsTab
                        sessions={sessions}
                        currentSession={currentSession}
                        disableSession={disableSession}
                        logout={logout}
                    />
                ) : activeTab === 'settings' ? (
                    <StylesTab/>
                ) : null}
            </div>
        </div>
    );
}

function ProfileTab({ name, setName, avatar, setAvatar, onFileChange, onSave, setEditing }) {
    return (
        <div>
            <h3 style={styles.h3}>Настройки профиля</h3>
            <form style={{ margin: '15px 0 0 0' }} onSubmit={(e) => { e.preventDefault(); onSave(); }}>
                <div style={styles.formRow}>
                    <label style={styles.label} htmlFor="name-input">Имя</label>
                    <input id="name-input" type="text" value={name} onChange={e => setName(e.target.value)} style={styles.input} required />
                </div>
                <div style={{ ...styles.formRow, marginBottom: '24px' }}>
                    <label style={ styles.label }>Аватар</label>
                    <input onChange={ onFileChange } type="file" accept="image/*" id="avatar-input" style="display:none;"/>
                    <label style={{ ...styles.input, ...styles.fileInput }} for="avatar-input">Нажмите, чтобы выбрать фото</label>
                </div>
                <div style={styles.formActions}>
                    <button type="submit" style={{ ...styles.button, ...styles.buttonPrimary }}>Сохранить</button>
                    <button type="button" onClick={() => setEditing(false)} style={{ ...styles.button, ...styles.buttonSecondary }}>Отмена</button>
                </div>
            </form>
        </div>
    );
}

function ProfileView({ name, avatar, setEditing }) {
    return (
        <div style={styles.profileView}>
            <div style={styles.profileAvatar}>
                <Avatar src={avatar} alt="avatar"/>
            </div>
            <div>
                <p style={{ ...styles.profileName, margin: 0 }}>{name}</p>
                <button onClick={() => setEditing(true)} style={{ ...styles.profileEditButton, ...styles.noDecor }}>Редактировать</button>
            </div>
        </div>
    );
}

function SessionsTab({ sessions, currentSession, disableSession, logout }) {
    return (<div>
         <h3 style={styles.h3}>Активные сессии</h3>
         <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column-reverse'}}>
            {sessions.map(session => {
                const latest = session.history[session.history.length - 1];
                return (
                <li key={session.id} style={styles.sessionListItem}>
                   <div>
                     <p style={styles.sessionInfo}>{session.history.map(x => x.ip || x.val).join(', ')} {session.id === currentSession.id && <span style={styles.sessionCurrentBadge}> (текущая)</span>}</p>
                     <p style={styles.sessionMeta}>Создана {TimeAgo({ unixTime: latest.at * 60000 }).toLowerCase()}, онлайн  {session.active ? TimeAgo({ unixTime: session.active * 1000 }).toLowerCase() : "неизвестно когда"}</p>
                   </div>
                   {session.id !== currentSession.id ?
                    <Hoverable func={() => disableSession(session)} text="Завершить"/> :
                    <Hoverable func={() => logout(session)} text="Выйти"/>
                  }
                </li>
            )})}
         </ul>
         <styles>
            
         </styles>
    </div>)
}

function Hoverable({ func, text }) {
  const [ hovered, setHovered ] = useState(false);

  return (
    <button onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)} onClick={func}
            style={{ ...styles.button, ...styles.logoutButton, ...(hovered && { opacity: 1 }) }}>{ text }</button>
  );
}
