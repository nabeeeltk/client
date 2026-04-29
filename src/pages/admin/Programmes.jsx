import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { getProgrammes, deleteProgramme } from '../../api'
import { formatDate } from '../../utils/helpers'
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminProgrammes() {
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    getProgrammes().then(r => setProgrammes(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProgramme(deleteTarget.id)
      toast.success('Programme deleted')
      setProgrammes(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch { toast.error('Failed to delete') } finally { setDeleting(false) }
  }

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-gold-600 rounded-full" />
            <h1 className="text-2xl font-bold text-gray-900">Programmes</h1>
          </div>
          <p className="text-gray-500 ml-5">{programmes.length} total programmes</p>
        </div>
        <Link to="/admin/programmes/create" className="btn-primary">
          <FiPlus size={16} /> Create Programme
        </Link>
      </div>

      {programmes.length === 0 ? (
        <EmptyState icon="📋" title="No programmes yet" action={<Link to="/admin/programmes/create" className="btn-primary">Create First Programme</Link>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {programmes.map(prog => (
            <div key={prog.id} className="card overflow-hidden hover:shadow-lg transition-shadow animate-fade-in group">
              <div className="relative h-44 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
                {prog.picture_url
                  ? <img src={prog.picture_url} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-6xl">📋</div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex flex-wrap gap-1">
                    {(prog.allocated_units || []).slice(0, 3).map(u => (
                      <span key={u.unit_id} className="text-xs bg-white/80 text-gray-800 px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
                        U{String(u.unit_number).padStart(2,'0')}
                      </span>
                    ))}
                    {(prog.allocated_units || []).length > 3 && (
                      <span className="text-xs bg-white/80 text-gray-800 px-2 py-0.5 rounded-full font-medium backdrop-blur-sm">
                        +{(prog.allocated_units || []).length - 3} more
                      </span>
                    )}
                    {(prog.allocated_units || []).length === 0 && (
                      <span className="text-xs bg-orange-500/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">Unallocated</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{prog.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">{prog.description || 'No description'}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(prog.created_at)}</span>
                  <span>{(prog.allocated_units || []).length} units</span>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Link to={`/admin/programmes/${prog.id}/edit`} className="flex-1 btn-outline text-xs py-1.5 justify-center">
                    <FiEdit2 size={13} /> Edit
                  </Link>
                  <button onClick={() => setDeleteTarget(prog)} className="flex-1 btn-danger text-xs py-1.5 justify-center">
                    <FiTrash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Programme"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated scores and allocations will also be removed.`}
      />
    </Layout>
  )
}
