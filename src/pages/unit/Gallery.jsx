import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import Lightbox from '../../components/shared/Lightbox'
import Pagination from '../../components/shared/Pagination'
import { getGallery, getProgrammes } from '../../api'
import { FiFilter } from 'react-icons/fi'

const PAGE_SIZE = 12

export default function UnitGallery() {
  const [photos, setPhotos] = useState([])
  const [programmes, setProgrammes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterProg, setFilterProg] = useState('')
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    Promise.all([getGallery(filterProg || undefined), getProgrammes()])
      .then(([gRes, pRes]) => { setPhotos(gRes.data); setProgrammes(pRes.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filterProg])

  const paged = photos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const lightboxImages = photos.map(p => ({ url: p.image_url, caption: p.caption }))

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 bg-gold-600 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        </div>
        <p className="text-gray-500 ml-5">Panchayat committee programme photos</p>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <FiFilter size={16} className="text-gray-400" />
        <select className="input w-auto" value={filterProg} onChange={e => { setFilterProg(e.target.value); setPage(1) }}>
          <option value="">All Photos</option>
          {programmes.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {paged.length === 0 ? (
        <EmptyState icon="🖼️" title="No photos yet" message="The admin will upload gallery photos soon." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {paged.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative group rounded-xl overflow-hidden aspect-square cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => setLightboxIdx((page - 1) * PAGE_SIZE + idx)}
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || 'Gallery'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
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
    </Layout>
  )
}
