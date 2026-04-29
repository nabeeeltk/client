import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiGrid, FiUsers, FiBookOpen, FiBell, FiImage, FiAward,
  FiLogOut, FiMenu, FiX, FiDroplet, FiUpload, FiBarChart2,
  FiHome, FiChevronRight
} from 'react-icons/fi'
import { GiIndiaGate } from 'react-icons/gi'

const adminNav = [
  { to: '/admin/dashboard',      icon: FiGrid,     label: 'Dashboard' },
  { to: '/admin/units',          icon: FiUsers,    label: 'Units' },
  { to: '/admin/programmes',     icon: FiBookOpen, label: 'Programmes' },
  { to: '/admin/announcements',  icon: FiBell,     label: 'Announcements' },
  { to: '/admin/gallery',        icon: FiImage,    label: 'Gallery' },
  { to: '/admin/leaderboard',    icon: FiAward,    label: 'Leaderboard' },
]

const unitNav = [
  { to: '/unit/dashboard',       icon: FiHome,     label: 'My Dashboard' },
  { to: '/unit/members',         icon: FiUsers,    label: 'Members' },
  { to: '/unit/programmes',      icon: FiBookOpen, label: 'My Programmes' },
  { to: '/unit/blood-members',   icon: FiDroplet,  label: 'Blood Members' },
  { to: '/unit/uploads',         icon: FiUpload,   label: 'My Uploads' },
  { to: '/unit/gallery',         icon: FiImage,    label: 'Gallery' },
  { to: '/unit/announcements',   icon: FiBell,     label: 'Announcements' },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const nav = isAdmin ? adminNav : unitNav

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-primary-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-inner">
            PC
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Panchayat</p>
            <p className="text-green-200 text-xs">Committee Portal</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-primary-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.username}</p>
            <p className="text-green-300 text-xs capitalize">{isAdmin ? '🛡️ Admin' : `🏢 ${user?.unit_name || 'Unit'}`}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`sidebar-item ${active ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <FiChevronRight size={14} />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-primary-600">
        <button
          onClick={handleLogout}
          className="sidebar-item sidebar-item-inactive w-full text-left"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-primary-700 text-white p-2 rounded-lg shadow-lg"
      >
        <FiMenu size={20} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 sidebar-gradient min-h-screen fixed left-0 top-0 z-30 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside className={`lg:hidden flex flex-col w-64 sidebar-gradient fixed left-0 top-0 bottom-0 z-50 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-white font-bold">Menu</span>
          <button onClick={() => setOpen(false)} className="text-white p-1">
            <FiX size={20} />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  )
}
