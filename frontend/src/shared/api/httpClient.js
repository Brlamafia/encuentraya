import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5080/api'
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')
const api = axios.create({ baseURL: API_URL, timeout: 12000 })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('encuentraya_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('encuentraya_token')
    localStorage.removeItem('encuentraya_user')
  }
  return Promise.reject(error)
})
export default api

export const assetUrl = (path) => !path ? null : path.startsWith('http') ? path : `${API_ORIGIN}${path}`
export const apiError = (error, fallback = 'No pudimos completar la operación.') => error?.response?.data?.message || error?.message || fallback
