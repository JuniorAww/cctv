import React, { useState, useEffect } from 'react'
import { Router } from 'preact-router'

import Dashboard from './pages/Dashboard'
import Participants from './pages/Participants'
import Cameras from './pages/Cameras'
import Settings from './pages/Settings'

import useAuth from './hooks/useAuth'
import AuthPage from './pages/AuthPage' // объединённая страница QR + login/register

export default function App() {
  const { api, token, logged, updateToken } = useAuth()
  const [ stage, setStage ] = useState(null) // auth | main
  const [ group, setGroup ] = useState(null)
  const [ groups, setGroups ] = useState(null)
  const [ users, setUsers ] = useState(null)
  const [ cameras, setCameras ] = useState(null)
  const [ currentPath, setCurrentPath ] = useState('/')

  // Загрузка данных группы
  useEffect(() => {
    if(!group || !token) return
    const interval = setInterval(fetchGroup, 60 * 1000)

    async function fetchGroup() {
      try {
        const response = await api(`groups/${group}?fields=cameras,users`, true, { method: 'GET' })
        const { success, group: _group } = await response.json()
        console.log(_group)
        setUsers(_group.users)
        setCameras(_group.cameras)
        removePreloader()
        console.log(_group.users, _group.cameras)
        setStage('main')
      } catch(e) {
        console.error(e)
      }
    }

    fetchGroup()
    return () => clearInterval(interval)
  }, [ group, token ])
  
  // Авторизация (получение токена при заходе на сайт)
  useEffect(() => { 
    console.log(logged, token)
    if (!logged) {
        if(token === undefined) return;
        removePreloader()
        return setStage('auth')
    }
    
    const init = async () => {
        const response = await api('users/me?fields=groups', true, { method: 'GET' })
        const { success, user } = await response.json()
        const _groups = user.groups
        
        setGroups(_groups)
        setGroup(_groups[0]?.id)
        console.log(_groups, 'setup')
        
        if (!_groups.length) {
          console.warn('Нет доступных групп')
          return
        }
    }
    
    init()
  }, [ logged, token ])

  const removePreloader = () => {
    const preloader = document.getElementById('preloader')
    if(preloader) preloader.remove()
  }

  const onLogin = (newToken) => {
    updateToken(newToken)
    console.log('new token', newToken)
  }
  
  const onGroupUserChange = newMember => {
    const _users = JSON.parse(JSON.stringify(users))
    console.log(users, newMember)
    const member = _users.find(x => x.id === newMember.id)
    member.name = newMember.name
    member.avatar = newMember.avatar
    setUsers(_users)
  }

  if(stage === null) return <div></div>

  if(stage === 'auth') {
    return <AuthPage api={api} onLogin={onLogin} />
  }
  
  console.log(groups, group)

  // Основной интерфейс
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-700 text-white p-4 flex justify-between items-center shadow">
        <h1 className="text-2xl font-bold">CCTV System</h1>
        <div className="flex items-center space-x-3">
          {groups?.length > 0 && (
            <select
              value={group}
              onChange={e => setGroup(e.target.value)}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          )}
          {/*<button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg shadow transition"
          >
            Выйти
          </button>*/}
        </div>
      </header>

      <Navigation
        groups={groups}
        group={group}
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
      />

      <main className="flex-1 p-6 overflow-auto bg-white shadow-inner rounded-t-lg">
        <Router onChange={e => setCurrentPath(e.url.split('?')[0])}>
          <Dashboard path="/" users={users} cameras={cameras} group={group} />
          <Cameras path="/cameras" token={token} cameras={cameras} group={group} api={api} />
          <Participants path="/participants" users={users} group={group} />
          <Settings api={api} onGroupUserChange={onGroupUserChange} path="/settings" groups={groups} group={group} />
        </Router>
      </main>
    </div>
  )
}

function Navigation({ groups, group, currentPath, setCurrentPath }) {
  const links = [
    { href: '/', label: 'Сводка' },
    { href: '/cameras', label: 'Просмотр' },
    { href: '/participants', label: 'Участники' },
    { href: '/settings', label: 'Настройки' },
  ]

  return (
    <nav className="bg-white shadow-md flex flex-wrap gap-2 p-3 justify-center">
      {links.map(link => (
        <a
          key={link.href}
          href={link.href + (group ? `?groupId=${group}` : '')}
          className={`px-4 py-2 rounded-lg transition ${
            currentPath === link.href
              ? 'bg-blue-600 text-white shadow'
              : 'bg-blue-50 hover:bg-blue-200 text-blue-700'
          }`}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}

