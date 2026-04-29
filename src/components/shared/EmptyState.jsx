export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-6xl mb-4">{icon || '📭'}</div>
      <h3 className="font-semibold text-gray-700 text-lg mb-2">{title || 'No data found'}</h3>
      <p className="text-gray-400 text-sm max-w-sm">{message || 'There are no items to display yet.'}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
