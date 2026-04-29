import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import { getLeaderboard, getLeaderboardByProgramme, getProgrammes } from '../../api'
import { getRankMedal } from '../../utils/helpers'
import { FiAward, FiFilter } from 'react-icons/fi'

export default function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [filterProg, setFilterProg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProgrammes().then(r => setProgrammes(r.data)).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const fn = filterProg ? getLeaderboardByProgramme(filterProg) : getLeaderboard()
    fn.then(r => setLeaderboard(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [filterProg])

  const top3 = leaderboard.slice(0, 3)
  const rest  = leaderboard.slice(3)

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-gold-600 rounded-full" />
            <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          </div>
          <p className="text-gray-500 ml-5">Unit rankings by total score</p>
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" size={16} />
          <select className="input w-auto" value={filterProg} onChange={e => setFilterProg(e.target.value)}>
            <option value="">All Programmes</option>
            {programmes.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <EmptyState icon="🏆" title="No scores yet" message="Assign scores to units from the Unit Detail page." />
      ) : (
        <>
          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            {[1, 0, 2].map(idx => {
              const unit = top3[idx]
              if (!unit) return <div key={idx} />
              const { icon, color } = getRankMedal(parseInt(unit.rank))
              const heights = ['h-36', 'h-44', 'h-28']
              const podiumH = [heights[1], heights[0], heights[2]]
              return (
                <div key={unit.id} className="flex flex-col items-center">
                  <div className={`w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg mb-2`}>
                    {String(unit.unit_number).padStart(2,'0')}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 text-center mb-1 truncate w-full px-1">{unit.unit_name.split(' ').slice(0,3).join(' ')}</p>
                  <p className="text-2xl font-bold text-primary-700 mb-2">{unit.total_score}</p>
                  <div className={`w-full ${podiumH[idx]} rounded-t-xl flex items-start justify-center pt-3 shadow-inner ${idx === 0 ? 'bg-gold-400' : idx === 1 ? 'bg-gray-300' : 'bg-orange-400'}`}>
                    <span className="text-3xl">{icon}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Full table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-16">Rank</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Unit</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaderboard.map(unit => {
                  const { icon, color } = getRankMedal(parseInt(unit.rank))
                  return (
                    <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`font-bold text-lg ${color}`}>{icon}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-xs font-bold">
                            {String(unit.unit_number).padStart(2,'0')}
                          </div>
                          <span className="font-medium text-gray-900">{unit.unit_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-primary-700 text-lg">{unit.total_score}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  )
}
