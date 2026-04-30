import axios from 'axios'

const api = axios.create({
  // Use your new environment variable here
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Using .replace is slightly better for UX so they can't click "back" to the locked page
      window.location.replace('/login')
    }
    return Promise.reject(err)
  }
)

export default api