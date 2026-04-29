// Designation badge color mapping
export const getDesignationClass = (designation) => {
  const map = {
    'President':      'badge-president',
    'Vice President': 'badge-vp',
    'Secretary':      'badge-secretary',
    'Treasurer':      'badge-treasurer',
    'Ward Member':    'badge-ward-member',
    'Member':         'badge-member',
  }
  return map[designation] || 'badge-member'
}

export const getDesignationBg = (designation) => {
  const map = {
    'President':      '#eab308',
    'Vice President': '#f97316',
    'Secretary':      '#16a34a',
    'Treasurer':      '#2563eb',
    'Ward Member':    '#9333ea',
    'Member':         '#6b7280',
  }
  return map[designation] || '#6b7280'
}

// Blood group badge class
export const getBloodClass = (bg) => {
  const map = {
    'A+':  'blood-a-pos',  'A-':  'blood-a-neg',
    'B+':  'blood-b-pos',  'B-':  'blood-b-neg',
    'O+':  'blood-o-pos',  'O-':  'blood-o-neg',
    'AB+': 'blood-ab-pos', 'AB-': 'blood-ab-neg',
  }
  return map[bg] || 'badge-member'
}

// Format date to IST
export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Initials avatar
export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

// File type icon helper
export const getFileIcon = (fileType) => {
  if (!fileType) return '📄'
  if (fileType.includes('image')) return '🖼️'
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('word') || fileType.includes('document')) return '📝'
  return '📁'
}

// Rank medal
export const getRankMedal = (rank) => {
  if (rank === 1) return { icon: '🥇', color: 'text-yellow-500' }
  if (rank === 2) return { icon: '🥈', color: 'text-gray-400' }
  if (rank === 3) return { icon: '🥉', color: 'text-orange-500' }
  return { icon: `#${rank}`, color: 'text-gray-600' }
}

export const DESIGNATIONS = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Ward Member', 'Member']
export const BLOOD_GROUPS  = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
export const GENDERS = ['Male', 'Female', 'Other']
