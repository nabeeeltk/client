import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import { getUnits } from '../../api'
import { FiSearch, FiUsers, FiArrowRight, FiStar } from 'react-icons/fi'

export default function AdminUnits() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getUnits().then(r => setUnits(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = units.filter(u =>
    u.unit_name.toLowerCase().includes(search.toLowerCase()) ||
    String(u.unit_number).includes(search)
  )

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-gold-600 rounded-full" />
            <h1 className="text-2xl font-bold text-gray-900">All Units</h1>
          </div>
          <p className="text-gray-500 ml-5">Managing {units.length} Panchayat units</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            className="input pl-9 w-64"
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🏢" title="No units found" message="Try adjusting your search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((unit) => (
            <Link
              key={unit.id}
              to={`/admin/units/${unit.id}`}
              className="card p-5 hover:shadow-lg transition-all duration-200 group cursor-pointer animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {String(unit.unit_number).padStart(2, '0')}
                </div>
                <FiArrowRight size={18} className="text-gray-300 group-hover:text-primary-600 transition-colors mt-1" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-3">{unit.unit_name}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <FiUsers size={12} />
                  <span>{unit.member_count} members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiStar size={12} className="text-gold-600" />
                  <span className="font-bold text-primary-700 text-sm">{unit.total_score}</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-primary-600 to-gold-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (unit.total_score / 200) * 100)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  )
}
