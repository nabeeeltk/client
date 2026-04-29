import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import Pagination from '../../components/shared/Pagination'
import { useAuth } from '../../context/AuthContext'
import { getUnitBloodMembers, createBloodMember, updateBloodMember, deleteBloodMember } from '../../api'
import { getBloodClass, BLOOD_GROUPS } from '../../utils/helpers'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPrinter, FiX, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

export default function UnitBloodMembers() {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterBG, setFilterBG] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ member_name: '', blood_group: 'A+', phone: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    if (!user?.unit_id) return
    setLoading(true)
    getUnitBloodMembers(user.unit_id).then(r => setMembers(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(load, [user])

  const handleEdit = (m) => {
    setEditTarget(m)
    setForm({ member_name: m.member_name, blood_group: m.blood_group, phone: m.phone || '', address: m.address || '' })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.member_name || !form.blood_group) return toast.error('Name and blood group required')
    setSaving(true)
    try {
      if (editTarget) { await updateBloodMember(editTarget.id, form); toast.success('Updated!') }
      else { await createBloodMember(form); toast.success('Added!') }
      setShowForm(false); setEditTarget(null); setForm({ member_name: '', blood_group: 'A+', phone: '', address: '' })
      load()
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteBloodMember(deleteTarget.id)
      toast.success('Deleted')
      setMembers(prev => prev.filter(m => m.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch { toast.error('Failed to delete') } finally { setDeleting(false) }
  }

  const filtered = members.filter(m => {
    const matchBG = !filterBG || m.blood_group === filterBG
    const matchQ = !search || m.member_name.toLowerCase().includes(search.toLowerCase())
    return matchBG && matchQ
  })
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-red-500 rounded-full" />
            <h1 className="text-2xl font-bold text-gray-900">Blood Member List</h1>
          </div>
          <p className="text-gray-500 ml-5">{filtered.length} members</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-outline no-print"><FiPrinter size={15} /> Print</button>
          <button onClick={() => { setShowForm(s => !s); setEditTarget(null); setForm({ member_name: '', blood_group: 'A+', phone: '', address: '' }) }} className="btn-primary">
            <FiPlus size={15} /> Add Member
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6 animate-fade-in">
          <h2 className="font-semibold text-gray-900 mb-4">{editTarget ? 'Edit' : 'Add'} Blood Member</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={form.member_name} onChange={e => setForm(f => ({ ...f, member_name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Blood Group *</label>
              <select className="input" value={form.blood_group} onChange={e => setForm(f => ({ ...f, blood_group: e.target.value }))} required>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost"><FiX size={15}/> Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                <FiCheck size={15} /> {saving ? 'Saving...' : editTarget ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 no-print">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input className="input pl-9" placeholder="Search by name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterBG('')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${!filterBG ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
          {BLOOD_GROUPS.map(bg => (
            <button key={bg} onClick={() => { setFilterBG(bg); setPage(1) }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterBG === bg ? getBloodClass(bg) : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {bg}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {paged.length === 0 ? (
        <EmptyState icon="🩸" title="No blood members found" action={<button onClick={() => setShowForm(true)} className="btn-primary"><FiPlus size={15}/> Add Member</button>} />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Blood Group</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Address</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{m.member_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getBloodClass(m.blood_group)}`}>{m.blood_group}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{m.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell truncate max-w-xs">{m.address || '—'}</td>
                    <td className="px-4 py-3 text-right no-print">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(m)} className="p-1.5 text-gray-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg"><FiEdit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(m)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Blood Member" message={`Delete "${deleteTarget?.member_name}"?`} />
    </Layout>
  )
}
