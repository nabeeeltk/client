import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader, CardSkeleton } from '../../components/shared/Loaders'
import { getUnits, getProgrammes, getAnnouncements, getGallery, getLeaderboard } from '../../api'
import { formatDateTime, getRankMedal } from '../../utils/helpers'
import { FiUsers, FiBookOpen, FiBell, FiImage, FiAward, FiActivity, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color, to }) {
  const content = (
    <div className={`stats-card hover:shadow-md transition-shadow cursor-pointer group`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
        <Icon size={26} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
      <FiArrowRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [units, programmes, announcements, gallery, lb] = await Promise.all([
          getUnits(), getProgrammes(), getAnnouncements(), getGallery(), getLeaderboard()
        ])
        setStats({
          units: units.data.length,
          programmes: programmes.data.length,
          announcements: announcements.data.length,
          gallery: gallery.data.length,
          members: units.data.reduce((acc, u) => acc + parseInt(u.member_count || 0), 0),
        })
        setLeaderboard(lb.data.slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 bg-gold-600 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <p className="text-gray-500 ml-5">Welcome back! Here's your committee overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard icon={FiUsers}    label="Total Units"         value={stats?.units || 0}         color="bg-primary-700" to="/admin/units" />
        <StatCard icon={FiUsers}    label="Total Members"       value={stats?.members || 0}        color="bg-blue-600"    to="/admin/units" />
        <StatCard icon={FiBookOpen} label="Programmes"          value={stats?.programmes || 0}     color="bg-gold-700"    to="/admin/programmes" />
        <StatCard icon={FiBell}     label="Announcements"       value={stats?.announcements || 0}  color="bg-orange-500"  to="/admin/announcements" />
        <StatCard icon={FiImage}    label="Gallery Photos"      value={stats?.gallery || 0}        color="bg-purple-600"  to="/admin/gallery" />
        <StatCard icon={FiAward}    label="Leaderboard Active"  value="Live"                       color="bg-teal-600"    to="/admin/leaderboard" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Leaderboard */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAward className="text-gold-600" size={18} />
              <h2 className="font-semibold text-gray-900">Top 5 Units</h2>
            </div>
            <Link to="/admin/leaderboard" className="text-primary-700 hover:underline text-sm font-medium flex items-center gap-1">
              Full Board <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {leaderboard.map((unit) => {
              const { icon, color } = getRankMedal(parseInt(unit.rank))
              return (
                <div key={unit.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className={`text-2xl w-8 text-center ${color}`}>{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{unit.unit_name}</p>
                    <p className="text-gray-400 text-xs">Unit {String(unit.unit_number).padStart(2, '0')}</p>
                  </div>
                  <span className="font-bold text-primary-700 text-lg">{unit.total_score}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiActivity className="text-primary-700" size={18} />
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { to: '/admin/programmes/create', label: 'Create Programme', icon: '📋', color: 'bg-green-50 hover:bg-green-100 text-green-800' },
              { to: '/admin/announcements',     label: 'New Announcement', icon: '📢', color: 'bg-orange-50 hover:bg-orange-100 text-orange-800' },
              { to: '/admin/gallery',           label: 'Upload Photos',    icon: '📸', color: 'bg-purple-50 hover:bg-purple-100 text-purple-800' },
              { to: '/admin/leaderboard',       label: 'Update Scores',    icon: '🏆', color: 'bg-gold-50 hover:bg-gold-100 text-gold-800' },
              { to: '/admin/units',             label: 'View All Units',   icon: '🏢', color: 'bg-blue-50 hover:bg-blue-100 text-blue-800' },
              { to: '/admin/programmes',        label: 'All Programmes',   icon: '📁', color: 'bg-teal-50 hover:bg-teal-100 text-teal-800' },
            ].map(({ to, label, icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 p-4 rounded-xl ${color} transition-colors`}
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-medium text-sm leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
