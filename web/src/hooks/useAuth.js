import { useState, useEffect, useRef } from 'react'
import API_URL from '../utils/API_URL'

const TOKEN_EXPIRE_THRESHOLD = 2

export default function useAuth() {
    const [ logged, setLogged ] = useState(false)
    const session = useRef(JSON.parse(localStorage.getItem('session') || '{}'))
    const [ token, setToken ] = useState(undefined)
    const tokenRef = useRef(null)
    
    function updateToken(_token) {
        setToken(_token)
        tokenRef.current = _token
        const [ payload, expiresAt ] = _token.split('.')
        session.current = { expiresAt: Number(expiresAt), userId: NaN }
        localStorage.setItem('session', JSON.stringify(session.current))
        setLogged(true)
    }

    function isLoggedIn() {
        return tokenRef.current != null && session.current?.expiresAt > Date.now() / 60000
    }

    async function refresh() {
        try {
            const res = await fetch(API_URL + 'auth/refresh', {
                method: 'POST',
                credentials: 'include',
            })
            const data = await res.json()
            if(data.token) {
                updateToken(data.token)
                return true
            }
            return false
        } catch(e) {
            console.error(e)
            return false
        }
    }
    
    async function api(path, authorized, opts = {}) {
        if(authorized) {
            if (!session.current 
                || Date.now() / 60000 > session.current.expiresAt - TOKEN_EXPIRE_THRESHOLD) {
                const ok = await refresh()
                if(!ok) return null
            }
            const headers = { ...(opts.headers || {}) }
            if(tokenRef.current) headers['Authorization'] = 'Bearer ' + tokenRef.current
            return fetch(API_URL + path, { ...opts, headers })
        } else {
            return fetch(API_URL + path, { ...opts })
        }
    }

    function unlogin() {
        localStorage.removeItem('session')
        setToken(null)
        tokenRef.current = null
        setLogged(false)
        window.location.href = '/'
    }
    
    useEffect(() => {
        if(!session.current?.expiresAt) return setToken(null);
        
        const [ payload, expiresAtRaw ] = token?.split('.') || [ null, 0 ]
        
        console.log('Token debug', token?.slice(0, 10))
        
        // expiresAt = UNIX Minutes
        const expiresAt = Number(expiresAtRaw)
        const MSToTokenUpdate = expiresAt * 60000 - Date.now() - 10000
        
        if(MSToTokenUpdate < 0) {
            return refresh().then(ok => {
                if(!ok) unlogin()
            })
        }
        
        const timeout = setTimeout(() => {
            refresh().then(ok => {
                if(!ok) unlogin()
            })
        }, MSToTokenUpdate)
        
        console.log('Will update token in', Math.ceil(MSToTokenUpdate / 100) / 10, 'seconds')
        
        return () => clearTimeout(timeout)
    }, [ token ])

    return { token, logged, updateToken, api, unlogin }
}

