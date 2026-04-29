import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { useAuth } from '../../context/AuthContext'
import { createMember } from '../../api'
import { DESIGNATIONS, GENDERS } from '../../utils/helpers'
import { FiArrowLeft, FiUpload, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AddMember() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    member_name: '', phone: '', email: '', address: '', ward_number: '',
    designation: 'Member', gender: 'Male', date_of_birth: '', joined_date: '', is_active: true
  })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return }
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.member_name.trim()) return toast.error('Member name is required')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (photo) fd.append('photo', photo)
      await createMember(fd)
      toast.success('Member added successfully!')
      navigate('/unit/members')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member')
    } finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/unit/members" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-700 text-sm mb-4">
          <FiArrowLeft size={16} /> Back to Members
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gold-600 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">Add New Member</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* Photo upload */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <div className="mb-4">
            {preview ? (
              <img src={preview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-primary-200 shadow-lg" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-dashed border-gray-300">
                <FiUser size={36} className="text-gray-400" />
              </div>
            )}
          </div>
          <label className="btn-outline cursor-pointer">
            <FiUpload size={14} /> Upload Photo
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} />
          </label>
          <p className="text-gray-400 text-xs mt-2">Max 2MB, JPG/PNG/WEBP</p>
        </div>

        {/* Form fields */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Member Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" value={form.member_name} onChange={e => set('member_name', e.target.value)} required placeholder="Full name" />
            </div>
            <div>
              <label className="label">Designation</label>
              <select className="input" value={form.designation} onChange={e => set('designation', e.target.value)}>
                {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ward Number</label>
              <input className="input" value={form.ward_number} onChange={e => set('ward_number', e.target.value)} placeholder="e.g. 04" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXXXXXXX" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input className="input" type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div>
              <label className="label">Joined Date</label>
              <input className="input" type="date" value={form.joined_date} onChange={e => set('joined_date', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <textarea className="input resize-none" rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">Active Member</label>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
            <Link to="/unit/members" className="btn-ghost">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </div>
      </form>
    </Layout>
  )
}
