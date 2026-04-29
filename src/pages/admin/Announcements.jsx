import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../api'
import { formatDateTime } from '../../utils/helpers'
import { FiPlus, FiEdit2, FiTrash2, FiBookmark, FiBell } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    getAnnouncements().then(r => setAnnouncements(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleEdit = (ann) => {
    setEditingId(ann.id)
    setForm({ title: ann.title, content: ann.content, is_pinned: ann.is_pinned })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) return toast.error('Title and content required')
    setSaving(true)
    try {
      if (editingId) {
        await updateAnnouncement(editingId, form)
        toast.success('Announcement updated')
      } else {
        await createAnnouncement(form)
        toast.success('Announcement created')
      }
      setShowForm(false); setEditingId(null); setForm({ title: '', content: '', is_pinned: false })
      load()
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAnnouncement(deleteTarget.id)
      toast.success('Announcement deleted')
      setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget.id))
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
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          </div>
          <p className="text-gray-500 ml-5">{announcements.length} total announcements</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setEditingId(null); setForm({ title: '', content: '', is_pinned: false }) }} className="btn-primary">
          <FiPlus size={16} /> New Announcement
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6 animate-fade-in">
          <h2 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit' : 'Create'} Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Content *</label>
              <textarea className="input min-h-28 resize-none" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <FiBookmark size={14} /> Pin this announcement
              </span>
            </label>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <EmptyState icon="📢" title="No announcements yet" />
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className={`card p-5 hover:shadow-md transition-shadow animate-fade-in ${ann.is_pinned ? 'border-l-4 border-gold-500' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ann.is_pinned ? 'bg-gold-100' : 'bg-primary-50'}`}>
                  {ann.is_pinned ? <FiBookmark className="text-gold-600" size={18} /> : <FiBell className="text-primary-600" size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                    {ann.is_pinned && <span className="chip-pinned">📌 Pinned</span>}
                  </div>
                  <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{ann.content}</p>
                  <p className="text-gray-400 text-xs mt-2">{formatDateTime(ann.created_at)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(ann)} className="btn-ghost px-2 py-2"><FiEdit2 size={15} /></button>
                  <button onClick={() => setDeleteTarget(ann)} className="btn-ghost px-2 py-2 text-red-500 hover:text-red-600 hover:bg-red-50"><FiTrash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Announcement" message={`Delete "${deleteTarget?.title}"?`} />
    </Layout>
  )
}
