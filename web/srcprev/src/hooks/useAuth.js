import { useState, useRef } from 'react'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const accessRef = useRef(null)

  async function login(email, password) {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!r.ok) throw new Error('login failed')
    const j = await r.json()
    accessRef.current = j.access
    setUser(j.user)
    return j
  }

  async function refresh() {
    const r = await fetch('/api/auth/refresh', { method: 'POST' })
    if (!r.ok) return false
    const j = await r.json()
    accessRef.current = j.access
    return true
  }

  async function api(path, opts = {}) {
    opts.headers = opts.headers || {}
    if (accessRef.current) opts.headers['Authorization'] = 'Bearer ' + accessRef.current
    let r = await fetch(path, opts)
    if (r.status === 401) {
      const ok = await refresh()
      if (!ok) throw new Error('unauthenticated')
      if (accessRef.current) opts.headers['Authorization'] = 'Bearer ' + accessRef.current
      r = await fetch(path, opts)
    }
    return r
  }

  return { login, api, user, accessRef, setUser }
}
