import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import { getProgrammes, getUnits, updateProgramme } from '../../api'
import { FiArrowLeft, FiUpload } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function EditProgramme() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [units, setUnits] = useState([])
  const [form, setForm] = useState({ title: '', description: '' })
  const [selectedUnits, setSelectedUnits] = useState([])
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    Promise.all([getProgrammes(), getUnits()]).then(([progRes, unitsRes]) => {
      const prog = progRes.data.find(p => p.id === parseInt(id))
      if (prog) {
        setForm({ title: prog.title, description: prog.description || '' })
        setPreview(prog.picture_url)
        setSelectedUnits((prog.allocated_units || []).map(u => u.unit_id))
      }
      setUnits(unitsRes.data)
    }).catch(console.error).finally(() => setInitialLoad(false))
  }, [id])

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    setPhoto(file)
    if (file) setPreview(URL.createObjectURL(file))
  }

  const toggleUnit = (uid) => setSelectedUnits(prev => prev.includes(uid) ? prev.filter(u => u !== uid) : [...prev, uid])
  const selectAll = () => setSelectedUnits(units.map(u => u.id))
  const clearAll  = () => setSelectedUnits([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('allocated_unit_ids', JSON.stringify(selectedUnits))
      if (photo) fd.append('picture', photo)
      await updateProgramme(id, fd)
      toast.success('Programme updated!')
      navigate('/admin/programmes')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    } finally { setLoading(false) }
  }

  if (initialLoad) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/admin/programmes" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-700 text-sm mb-4">
          <FiArrowLeft size={16} /> Back to Programmes
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 bg-gold-600 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">Edit Programme</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Programme Details</h2>
            <div>
              <label className="label">Title *</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-28 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Cover Photo</h2>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
                {preview ? (
                  <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-xl object-cover" />
                ) : (
                  <>
                    <FiUpload className="mx-auto text-gray-400 mb-2" size={28} />
                    <p className="text-gray-500 text-sm">Click to upload new photo</p>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Allocate to Units</h2>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={selectAll} className="text-primary-700 hover:underline">All</button>
              <span className="text-gray-300">|</span>
              <button type="button" onClick={clearAll} className="text-red-600 hover:underline">None</button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">{selectedUnits.length} of {units.length} selected</p>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {units.map(unit => (
              <label key={unit.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                <input type="checkbox" checked={selectedUnits.includes(unit.id)} onChange={() => toggleUnit(unit.id)} className="w-4 h-4 text-primary-600 rounded" />
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String(unit.unit_number).padStart(2,'0')}
                </span>
                <span className="text-sm text-gray-700 truncate">{unit.unit_name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 flex justify-end gap-3">
          <Link to="/admin/programmes" className="btn-ghost">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Layout>
  )
}
