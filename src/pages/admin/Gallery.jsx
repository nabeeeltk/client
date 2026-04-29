import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import Lightbox from '../../components/shared/Lightbox'
import Pagination from '../../components/shared/Pagination'
import { getGallery, uploadGallery, deleteGalleryPhoto, getProgrammes } from '../../api'
import { formatDateTime } from '../../utils/helpers'
import { FiUpload, FiTrash2, FiFilter } from 'react-icons/fi'
import toast from 'react-hot-toast'

const PAGE_SIZE = 12

export default function AdminGallery() {
  const [photos, setPhotos] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterProg, setFilterProg] = useState('')
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({ caption: '', programme_id: '' })
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const [gRes, pRes] = await Promise.all([getGallery(filterProg || undefined), getProgrammes()])
      setPhotos(gRes.data)
      setProgrammes(pRes.data)
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filterProg])

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      Array.from(files).forEach(f => fd.append('images', f))
      if (uploadForm.caption) fd.append('caption', uploadForm.caption)
      if (uploadForm.programme_id) fd.append('programme_id', uploadForm.programme_id)
      await uploadGallery(fd)
      toast.success(`${files.length} photo(s) uploaded!`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally { setUploading(false); e.target.value = '' }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteGalleryPhoto(deleteTarget.id)
      toast.success('Photo deleted')
      setPhotos(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch { toast.error('Failed to delete') } finally { setDeleting(false) }
  }

  const pagedPhotos = photos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const lightboxImages = photos.map(p => ({ url: p.image_url, caption: p.caption }))

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 bg-gold-600 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        </div>
        <p className="text-gray-500 ml-5">{photos.length} photos</p>
      </div>

      {/* Upload section */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiUpload size={16} /> Upload Photos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Caption (optional)</label>
            <input className="input" placeholder="Add a caption..." value={uploadForm.caption} onChange={e => setUploadForm(f => ({ ...f, caption: e.target.value }))} />
          </div>
          <div>
            <label className="label">Programme (optional)</label>
            <select className="input" value={uploadForm.programme_id} onChange={e => setUploadForm(f => ({ ...f, programme_id: e.target.value }))}>
              <option value="">General Gallery</option>
              {programmes.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="btn-primary w-full justify-center cursor-pointer">
              {uploading ? 'Uploading...' : <><FiUpload size={15} /> Select Photos</>}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <FiFilter size={16} className="text-gray-400" />
        <select className="input w-auto" value={filterProg} onChange={e => { setFilterProg(e.target.value); setPage(1) }}>
          <option value="">All Photos</option>
          {programmes.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {/* Grid */}
      {pagedPhotos.length === 0 ? (
        <EmptyState icon="🖼️" title="No photos yet" message="Upload photos using the form above." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {pagedPhotos.map((photo, idx) => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={photo.image_url}
                  alt={photo.caption || 'Gallery'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onClick={() => setLightboxIdx((page - 1) * PAGE_SIZE + idx)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(photo) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-lg shadow-lg"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(photos.length / PAGE_SIZE)} onPageChange={setPage} />
        </>
      )}

      {lightboxIdx !== null && (
        <Lightbox images={lightboxImages} initialIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Photo" message="Delete this photo permanently?" />
    </Layout>
  )
}
