import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import MemberCard from '../../components/shared/MemberCard'
import Pagination from '../../components/shared/Pagination'
import { useAuth } from '../../context/AuthContext'
import { getUnitMembers, deleteMember } from '../../api'
import { DESIGNATIONS } from '../../utils/helpers'
import { FiPlus, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

export default function UnitMembers() {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [desig, setDesig] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    if (!user?.unit_id) return
    setLoading(true)
    getUnitMembers(user.unit_id).then(r => setMembers(r.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(load, [user])

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    const matchQ = !q || m.member_name.toLowerCase().includes(q) || (m.ward_number || '').includes(q)
    const matchD = !desig || m.designation === desig
    const matchS = !status || (status === 'active' ? m.is_active : !m.is_active)
    return matchQ && matchD && matchS
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteMember(deleteTarget.id)
      toast.success('Member deactivated')
      setDeleteTarget(null)
      load()
    } catch { toast.error('Failed to deactivate') } finally { setDeleting(false) }
  }

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-gold-600 rounded-full" />
            <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          </div>
          <p className="text-gray-500 ml-5">{filtered.length} of {members.length} members</p>
        </div>
        <Link to="/unit/members/add" className="btn-primary">
          <FiPlus size={16} /> Add Member
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 no-print">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input className="input pl-9" placeholder="Search by name or ward..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input w-auto" value={desig} onChange={e => { setDesig(e.target.value); setPage(1) }}>
          <option value="">All Designations</option>
          {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={() => window.print()} className="btn-outline no-print">🖨️ Print</button>
      </div>

      {paged.length === 0 ? (
        <EmptyState icon="👥" title="No members found" action={<Link to="/unit/members/add" className="btn-primary"><FiPlus size={15}/> Add First Member</Link>} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paged.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                onEdit={(mem) => window.location.href = `/unit/members/${mem.id}/edit`}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Deactivate Member"
        message={`Are you sure you want to deactivate "${deleteTarget?.member_name}"? They will be marked as inactive.`}
        confirmLabel="Deactivate"
      />
    </Layout>
  )
}
