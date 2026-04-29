import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import { useAuth } from '../../context/AuthContext'
import { getUnit, getUnitProgrammes, getAnnouncements, getUnitScores, getLeaderboard } from '../../api'
import { formatDateTime, getRankMedal } from '../../utils/helpers'
import { FiBookOpen, FiBell, FiBookmark } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export default function UnitDashboard() {
  const { user } = useAuth()
  const [unit, setUnit] = useState(null)
  const [programmes, setProgs] = useState([])
  const [announcements, setAnns] = useState([])
  const [scores, setScores] = useState([])
  const [rank, setRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = user?.unit_id
    if (!uid) return
    Promise.all([
      getUnit(uid),
      getUnitProgrammes(uid),
      getAnnouncements(),
      getUnitScores(uid),
      getLeaderboard(),
    ]).then(([u, p, a, s, lb]) => {
      setUnit(u.data)
      setProgs(p.data)
      setAnns(a.data.slice(0, 3))
      setScores(s.data)
      const myRank = lb.data.find(item => item.id === uid)
      setRank(myRank)
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (loading) return <Layout><PageLoader /></Layout>

  const totalScore = scores.reduce((acc, s) => acc + s.score, 0)
  const rankMedal = rank ? getRankMedal(parseInt(rank.rank)) : { icon: '—', color: 'text-gray-500' }
  const rankValue = rank ? '#' + rank.rank : '—'

  const statsCards = [
    { label: 'Members',   value: unit?.member_count || 0, icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Programmes',value: programmes.length,       icon: '📋', color: 'bg-green-50 text-green-700' },
    { label: 'My Score',  value: totalScore,               icon: '⭐', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Rank',      value: rankValue,                icon: rankMedal.icon, color: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <Layout>
      {/* Unit info card */}
      <div className="card bg-gradient-to-r from-primary-700 to-primary-800 text-white p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner">
            {String(unit?.unit_number || '').padStart(2, '0')}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{unit?.unit_name}</h1>
            <p className="text-green-200 text-sm mt-1">{unit?.description}</p>
          </div>
          <div className="text-right">
            <p className="text-yellow-300 text-3xl font-bold">{totalScore}</p>
            <p className="text-green-300 text-xs">Total Score</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statsCards.map(({ label, value, icon, color }) => (
          <div key={label} className={'card p-4 ' + color}>
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-70 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent announcements */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiBell className="text-primary-700" size={18} />
              <h2 className="font-semibold text-gray-900">Latest Announcements</h2>
            </div>
            <Link to="/unit/announcements" className="text-primary-700 text-sm hover:underline">View all</Link>
          </div>
          <div className="p-4 space-y-3">
            {announcements.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No announcements</p>
            )}
            {announcements.map(ann => (
              <div key={ann.id} className={'p-3 rounded-xl ' + (ann.is_pinned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50')}>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{ann.title}</h4>
                  {ann.is_pinned && (
                    <span className="chip-pinned">
                      <FiBookmark size={10} /> Pinned
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-xs line-clamp-2">{ann.content}</p>
                <p className="text-gray-400 text-xs mt-1">{formatDateTime(ann.created_at)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My Programmes */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiBookOpen className="text-primary-700" size={18} />
              <h2 className="font-semibold text-gray-900">My Programmes</h2>
            </div>
            <Link to="/unit/programmes" className="text-primary-700 text-sm hover:underline">View all</Link>
          </div>
          <div className="p-4 space-y-2">
            {programmes.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No programmes allocated</p>
            )}
            {programmes.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  {p.picture_url
                    ? <img src={p.picture_url} alt={p.title} className="w-full h-full rounded-lg object-cover" />
                    : '📋'
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{p.title}</p>
                  <p className="text-gray-400 text-xs line-clamp-1">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
