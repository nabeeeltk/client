// Spinner component
export function Spinner({ size = 'md', color = 'primary' }) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  const colorMap = { primary: 'border-primary-600', gold: 'border-gold-600', white: 'border-white' }
  return (
    <div className={`animate-spin rounded-full border-4 border-gray-200 ${sizeMap[size]} ${colorMap[color]} border-t-current`} />
  )
}

// Full page loading
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <Spinner size="lg" color="primary" />
        <p className="mt-3 text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  )
}

// Member card skeleton
export function MemberCardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  )
}

// Row skeleton
export function RowSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}
