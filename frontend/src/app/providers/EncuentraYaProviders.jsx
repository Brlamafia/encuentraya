import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { apiError } from '../../shared/api/httpClient'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('encuentraya_user') || 'null'))
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('encuentraya_token')))

  const persistSession = (data) => {
    localStorage.setItem('encuentraya_token', data.token)
    localStorage.setItem('encuentraya_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  useEffect(() => {
    if (!localStorage.getItem('encuentraya_token')) { setChecking(false); return }
    api.get('/users/me').then(({ data }) => {
      localStorage.setItem('encuentraya_user', JSON.stringify(data)); setUser(data)
    }).catch(() => {
      localStorage.removeItem('encuentraya_token'); localStorage.removeItem('encuentraya_user'); setUser(null)
    }).finally(() => setChecking(false))
  }, [])

  const login = async (email, password) => {
    try { const { data } = await api.post('/auth/login', { email, password }); persistSession(data); return data.user }
    catch (error) { throw new Error(apiError(error, 'No pudimos iniciar sesión.')) }
  }
  const register = async (payload) => {
    try { const { data } = await api.post('/auth/register', payload); persistSession(data); return data.user }
    catch (error) { throw new Error(apiError(error, 'No pudimos crear tu cuenta.')) }
  }
  const updateProfile = async (payload) => {
    const { data } = await api.put('/users/me', payload)
    localStorage.setItem('encuentraya_user', JSON.stringify(data)); setUser(data); return data
  }
  const logout = () => { localStorage.removeItem('encuentraya_token'); localStorage.removeItem('encuentraya_user'); setUser(null) }

  return <AuthContext.Provider value={{ user, checking, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)

const NoticeContext = createContext(null)
export function NoticeProvider({ children }) {
  const { user } = useAuth()
  const [notices, setNotices] = useState([])
  const [toast, setToast] = useState(null)
  const refreshNotices = async () => {
    if (!user) { setNotices([]); return }
    try { const { data } = await api.get('/notifications'); setNotices(data) } catch { /* page-level requests show actionable errors */ }
  }
  useEffect(() => { refreshNotices(); if (!user) return; const timer = setInterval(refreshNotices, 30000); return () => clearInterval(timer) }, [user?.id])
  const notify = (message, tone = 'success') => { setToast({ message, tone }); window.setTimeout(() => setToast(null), 3800) }
  const markRead = async (id) => { await api.patch(`/notifications/${id}/read`); setNotices((all) => all.map((n) => n.id === id ? { ...n, isRead: true } : n)) }
  const value = useMemo(() => ({ notices, unread: notices.filter((n) => !n.isRead).length, markRead, notify, refreshNotices }), [notices])
  return <NoticeContext.Provider value={value}>{children}{toast && <div className={`toast ${toast.tone}`} role="status">{toast.message}</div>}</NoticeContext.Provider>
}
export const useNotices = () => useContext(NoticeContext)
