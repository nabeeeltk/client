import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import { PageLoader } from '../../components/shared/Loaders'
import EmptyState from '../../components/shared/EmptyState'
import { getAnnouncements } from '../../api'
import { formatDateTime } from '../../utils/helpers'
import { FiBell, FiBookmark } from 'react-icons/fi'

export default function UnitAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnnouncements().then(r => setAnnouncements(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><PageLoader /></Layout>

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-8 bg-gold-600 rounded-full" />
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        </div>
        <p className="text-gray-500 ml-5">Official announcements from the Panchayat Committee</p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState icon="📢" title="No announcements yet" />
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => (
            <div
              key={ann.id}
              className={`card p-5 hover:shadow-md transition-shadow animate-fade-in ${ann.is_pinned ? 'border-l-4 border-gold-500 bg-gradient-to-r from-gold-50 to-white' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${ann.is_pinned ? 'bg-gold-500' : 'bg-primary-700'}`}>
                  {ann.is_pinned ? <FiBookmark className="text-white" size={20} /> : <FiBell className="text-white" size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="font-bold text-gray-900 text-base">{ann.title}</h3>
                    {ann.is_pinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-800 border border-gold-200">
                        <FiBookmark size={10} /> Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  <p className="text-gray-400 text-xs mt-3 flex items-center gap-1">
                    🕒 {formatDateTime(ann.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
