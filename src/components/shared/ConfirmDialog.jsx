import { useEffect } from 'react'
import { FiAlertTriangle, FiX } from 'react-icons/fi'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FiAlertTriangle className="text-red-600" size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">{title || 'Confirm Action'}</h3>
            <p className="text-gray-500 mt-1 text-sm">{message || 'Are you sure you want to proceed? This action cannot be undone.'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <FiX size={20} />
          </button>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
