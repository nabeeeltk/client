import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { PageLoader, RowSkeleton } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import MemberCard from '../../components/shared/MemberCard'
import Pagination from '../../components/shared/Pagination'
import { getUnit, getUnitMembers, getUnitBloodMembers, getUnitUploads, getUnitProgrammes, getUnitScores, createScore, updateScore } from '../../api'
import { formatDate, formatDateTime, getBloodClass, getFileIcon, getRankMedal, DESIGNATIONS, BLOOD_GROUPS } from '../../utils/helpers'
import { FiArrowLeft, FiSearch, FiDownload, FiPrinter, FiPlus, FiEdit2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

const TABS = ['Members', 'Blood List', 'Uploads', 'Programmes', 'Scores & Rank']
const PAGE_SIZE = 10

export default function AdminUnitDetail() {
  const { id } = useParams()
  const [unit, setUnit] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [tabData, setTabData] = useState({})
  const [loadingTab, setLoadingTab] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [memberDesig, setMemberDesig] = useState('')
  const [memberPage, setMemberPage] = useState(1)
  const [scoreForm, setScoreForm] = useState({ programme_id: '', score: '', notes: '' })
  const [scoreLoading, setSL] = useState(false)
  const [programmes, setProgs] = useState([])

  useEffect(() => {
    getUnit(id).then(r => setUnit(r.data)).catch(console.error)
    getUnitProgrammes(id).then(r => setProgs(r.data)).catch(console.error)
  }, [id])

  const loadTab = useCallback(async (tabIdx) => {
    if (tabData[tabIdx]) return
    setLoadingTab(true)
    try {
      let data
      if (tabIdx === 0) data = (await getUnitMembers(id)).data
      else if (tabIdx === 1) data = (await getUnitBloodMembers(id)).data
      else if (tabIdx === 2) data = (await getUnitUploads(id)).data
      else if (tabIdx === 3) data = (await getUnitProgrammes(id)).data
      else if (tabIdx === 4) data = (await getUnitScores(id)).data
      setTabData(prev => ({ ...prev, [tabIdx]: data }))
    } catch { } finally { setLoadingTab(false) }
  }, [id, tabData])

  useEffect(() => { loadTab(activeTab) }, [activeTab, loadTab])

  const handleTabClick = (idx) => { setActiveTab(idx); setMemberPage(1) }

  // Members tab filters
  const filteredMembers = (tabData[0] || []).filter(m => {
    const q = memberSearch.toLowerCase()
    const matchQ = !q || m.member_name.toLowerCase().includes(q) || (m.ward_number || '').includes(q)
    const matchD = !memberDesig || m.designation === memberDesig
    return matchQ && matchD
  })
  const totalMemberPages = Math.ceil(filteredMembers.length / PAGE_SIZE)
  const pagedMembers = filteredMembers.slice((memberPage - 1) * PAGE_SIZE, memberPage * PAGE_SIZE)

  // Score submit
  const handleScoreSubmit = async (e) => {
    e.preventDefault()
    if (!scoreForm.programme_id || !scoreForm.score) return toast.error('Programme and score required')
    setSL(true)
    try {
      await createScore({ unit_id: parseInt(id), programme_id: parseInt(scoreForm.programme_id), score: parseInt(scoreForm.score), notes: scoreForm.notes })
      toast.success('Score saved!')
      setScoreForm({ programme_id: '', score: '', notes: '' })
      setTabData(prev => ({ ...prev, 4: undefined }))
      loadTab(4)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save score')
    } finally { setSL(false) }
  }

  if (!unit) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/units" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-700 text-sm mb-4">
          <FiArrowLeft size={16} /> Back to Units
        </Link>
        <div className="card p-6 bg-gradient-to-r from-primary-700 to-primary-800 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              {String(unit.unit_number).padStart(2, '0')}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{unit.unit_name}</h1>
              <p className="text-green-200 text-sm mt-1">{unit.description}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-3xl font-bold text-gold-300">{unit.total_score}</p>
              <p className="text-green-300 text-xs">Total Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-print">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => handleTabClick(i)}
            className={`tab-btn flex-shrink-0 ${activeTab === i ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 0 — Members */}
      {activeTab === 0 && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5 no-print">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input className="input pl-9" placeholder="Search by name or ward..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={memberDesig} onChange={e => setMemberDesig(e.target.value)}>
              <option value="">All Designations</option>
              {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={() => window.print()} className="btn-outline no-print"><FiPrinter size={15} /> Print</button>
          </div>
          {loadingTab ? <RowSkeleton /> : filteredMembers.length === 0 ? (
            <EmptyState icon="👥" title="No members found" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pagedMembers.map(m => <MemberCard key={m.id} member={m} showActions={false} />)}
              </div>
              <Pagination currentPage={memberPage} totalPages={totalMemberPages} onPageChange={setMemberPage} />
            </>
          )}
        </div>
      )}

      {/* Tab 1 — Blood List */}
      {activeTab === 1 && (
        <div>
          {loadingTab ? <RowSkeleton /> : (tabData[1] || []).length === 0 ? (
            <EmptyState icon="🩸" title="No blood members found" />
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Blood Group</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(tabData[1] || []).map(bm => (
                    <tr key={bm.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{bm.member_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getBloodClass(bm.blood_group)}`}>
                          {bm.blood_group}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{bm.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{bm.address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2 — Uploads */}
      {activeTab === 2 && (
        <div>
          {loadingTab ? <RowSkeleton /> : (tabData[2] || []).length === 0 ? (
            <EmptyState icon="📁" title="No uploads found" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(tabData[2] || []).map(f => (
                <div key={f.id} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getFileIcon(f.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{f.title}</h4>
                      {f.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{f.description}</p>}
                      <p className="text-gray-400 text-xs mt-1">{formatDateTime(f.uploaded_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3 — Programmes */}
      {activeTab === 3 && (
        <div>
          {loadingTab ? <RowSkeleton /> : (tabData[3] || []).length === 0 ? (
            <EmptyState icon="📋" title="No programmes allocated" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(tabData[3] || []).map(p => (
                <div key={p.id} className="card overflow-hidden hover:shadow-md transition-shadow">
                  {p.picture_url && <img src={p.picture_url} alt={p.title} className="w-full h-40 object-cover" />}
                  {!p.picture_url && <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-5xl">📋</div>}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900">{p.title}</h4>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{p.description}</p>
                    <p className="text-gray-400 text-xs mt-2">{formatDate(p.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4 — Scores & Rank */}
      {activeTab === 4 && (
        <div className="space-y-6">
          {/* Add Score Form */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiPlus size={16} /> Assign/Update Score</h3>
            <form onSubmit={handleScoreSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Programme</label>
                <select className="input" value={scoreForm.programme_id} onChange={e => setScoreForm(f => ({ ...f, programme_id: e.target.value }))} required>
                  <option value="">Select Programme</option>
                  {programmes.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Score</label>
                <input type="number" min="0" max="1000" className="input" value={scoreForm.score} onChange={e => setScoreForm(f => ({ ...f, score: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Notes</label>
                <input type="text" className="input" placeholder="Optional remarks" value={scoreForm.notes} onChange={e => setScoreForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <button type="submit" disabled={scoreLoading} className="btn-primary">
                  {scoreLoading ? 'Saving...' : 'Save Score'}
                </button>
              </div>
            </form>
          </div>

          {/* Score history */}
          {loadingTab ? <RowSkeleton /> : (tabData[4] || []).length === 0 ? (
            <EmptyState icon="🏆" title="No scores yet" message="Assign scores using the form above." />
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Programme</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Score</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Notes</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(tabData[4] || []).map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.programme_title}</td>
                      <td className="px-4 py-3"><span className="font-bold text-primary-700 text-lg">{s.score}</span></td>
                      <td className="px-4 py-3 text-gray-500">{s.notes || '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(s.awarded_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
