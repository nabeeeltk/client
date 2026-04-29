import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) {
      setError('Please enter username and password')
      return
    }
    const result = await login(form.username, form.password)
    if (result.success) {
      toast.success(`Welcome, ${result.user.username}!`)
      navigate(result.user.role === 'admin' ? '/admin/dashboard' : '/unit/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #052e16 0%, #166534 50%, #15803d 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-gold-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-2xl">
            PC
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Panchayat Committee<br />Management Portal
          </h1>
          <p className="text-green-200 text-lg leading-relaxed">
            Efficiently manage all 21 units, programmes, members, and community initiatives through a unified digital platform.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { num: '21', label: 'Units' },
              { num: '100+', label: 'Members' },
              { num: '∞', label: 'Programmes' },
            ].map(({ num, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-3xl font-bold text-gold-300">{num}</div>
                <div className="text-green-200 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center text-white font-bold">PC</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Panchayat Committee</p>
                <p className="text-gray-400 text-xs">Management Portal</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your credentials to access the portal</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="admin or unit_01"
                    value={form.username}
                    onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base disabled:opacity-70"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-700">Demo Credentials:</p>
              <p>Admin: <code className="bg-gray-200 px-1 rounded">admin</code> / <code className="bg-gray-200 px-1 rounded">admin123</code></p>
              <p>Unit: <code className="bg-gray-200 px-1 rounded">unit_01</code> / <code className="bg-gray-200 px-1 rounded">unit01pass</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
