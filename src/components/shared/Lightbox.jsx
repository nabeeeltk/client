import { useState, useEffect } from 'react'
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Lightbox({ images, initialIndex = 0, onClose }) {
  const [current, setCurrent] = useState(initialIndex)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(c + 1, images.length - 1))
      if (e.key === 'ArrowLeft')  setCurrent(c => Math.max(c - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [images.length, onClose])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors z-10"
      >
        <FiX size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent(c => Math.max(c - 1, 0)) }}
            disabled={current === 0}
            className="absolute left-4 text-white bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors disabled:opacity-30"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent(c => Math.min(c + 1, images.length - 1)) }}
            disabled={current === images.length - 1}
            className="absolute right-4 text-white bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors disabled:opacity-30"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      <div className="max-w-4xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[current]?.url}
          alt={images[current]?.caption || 'Gallery image'}
          className="max-w-full max-h-[80vh] object-contain rounded-xl"
        />
        {images[current]?.caption && (
          <p className="text-white text-center mt-3 text-sm opacity-80">{images[current].caption}</p>
        )}
        {images.length > 1 && (
          <p className="text-white/50 text-center text-xs mt-1">{current + 1} / {images.length}</p>
        )}
      </div>
    </div>
  )
}
