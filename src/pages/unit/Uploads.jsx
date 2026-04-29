import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import Pagination from '../../components/shared/Pagination'
import { useAuth } from '../../context/AuthContext'
import { getUnitUploads, createUpload, deleteUpload } from '../../api'
import { formatDateTime, getFileIcon } from '../../utils/helpers'
import { FiUpload, FiTrash2, FiFile, FiX, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

export default function UnitUploads() {
  const { user } = useAuth()
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)

  const load = () => {
    if (!user?.unit_id) return
    setLoading(true)
    getUnitUploads(user.unit_id).then(r => setUploads(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(load, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file')
    if (!form.title) return toast.error('Title is required')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', form.title)
      fd.append('description', form.description)
      await createUpload(fd)
      toast.success('File uploaded!')
      setShowForm(false); setForm({ title: '', description: '' }); setFile(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteUpload(deleteTarget.id)
      toast.success('Deleted')
      setUploads(prev => prev.filter(u => u.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch { toast.error('Failed to delete') } finally { setDeleting(false) }
  }

  const paged = uploads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-gold-600 rounded-full" />
            <h1 className="text-2xl font-bold text-gray-900">My Uploads</h1>
          </div>
          <p className="text-gray-500 ml-5">{uploads.length} files uploaded</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          <FiUpload size={15} /> Upload File
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 animate-fade-in">
          <h2 className="font-semibold text-gray-900 mb-4">Upload File</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">File *</label>
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <span className="text-gray-700 font-medium text-sm">{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <FiFile className="mx-auto text-gray-400 mb-2" size={28} />
                      <p className="text-gray-500 text-sm">Click to select file</p>
                      <p className="text-gray-400 text-xs mt-1">Images, PDF, DOC/DOCX — max 5MB</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={e => setFile(e.target.files[0])} />
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost"><FiX size={14}/> Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                <FiCheck size={14}/> {saving ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      {paged.length === 0 ? (
        <EmptyState icon="📁" title="No files uploaded" action={<button onClick={() => setShowForm(true)} className="btn-primary"><FiUpload size={15}/> Upload First File</button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paged.map(f => (
              <div key={f.id} className="card p-4 hover:shadow-md transition-shadow animate-fade-in">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl flex-shrink-0">{getFileIcon(f.file_type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{f.title}</h4>
                    {f.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{f.description}</p>}
                    <p className="text-gray-400 text-xs mt-1">{formatDateTime(f.uploaded_at)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline text-xs font-medium">
                    View File
                  </a>
                  <button onClick={() => setDeleteTarget(f)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(uploads.length / PAGE_SIZE)} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete File" message={`Delete "${deleteTarget?.title}"?`} />
    </Layout>
  )
}
