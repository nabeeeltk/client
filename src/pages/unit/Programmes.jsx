import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { getUnitProgrammes } from '../../api'
import { formatDate } from '../../utils/helpers'
import { FiBookOpen } from 'react-icons/fi'

export default function UnitProgrammes() {
  const { user } = useAuth()
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.unit_id) return
    getUnitProgrammes(user.unit_id).then(r => setProgrammes(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 bg-gold-600 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">My Programmes</h1>
        </div>
        <p className="text-gray-500 ml-5">{programmes.length} programmes allocated to your unit</p>
      </div>

      {programmes.length === 0 ? (
        <EmptyState icon="📋" title="No programmes allocated" message="The admin will allocate programmes to your unit soon." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programmes.map(prog => (
            <div key={prog.id} className="card overflow-hidden hover:shadow-lg transition-shadow group animate-fade-in">
              <div className="relative h-44 overflow-hidden">
                {prog.picture_url
                  ? <img src={prog.picture_url} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-6xl">📋</div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FiBookOpen className="text-primary-600" size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{prog.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-3">{prog.description || 'No description provided'}</p>
                    <p className="text-gray-400 text-xs mt-2">Created {formatDate(prog.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
