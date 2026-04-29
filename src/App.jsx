import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import LoginPage from './pages/LoginPage'

// Admin pages
import AdminDashboard     from './pages/admin/Dashboard'
import AdminUnits         from './pages/admin/Units'
import AdminUnitDetail    from './pages/admin/UnitDetail'
import AdminProgrammes    from './pages/admin/Programmes'
import AdminCreateProg    from './pages/admin/CreateProgramme'
import AdminEditProg      from './pages/admin/EditProgramme'
import AdminAnnouncements from './pages/admin/Announcements'
import AdminGallery       from './pages/admin/Gallery'
import AdminLeaderboard   from './pages/admin/Leaderboard'

// Unit pages
import UnitDashboard     from './pages/unit/Dashboard'
import UnitMembers       from './pages/unit/Members'
import UnitAddMember     from './pages/unit/AddMember'
import UnitEditMember    from './pages/unit/EditMember'
import UnitProgrammes    from './pages/unit/Programmes'
import UnitBloodMembers  from './pages/unit/BloodMembers'
import UnitUploads       from './pages/unit/Uploads'
import UnitGallery       from './pages/unit/Gallery'
import UnitAnnouncements from './pages/unit/Announcements'

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/unit/dashboard'} replace />
  return children
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/unit/dashboard'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard"            element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/units"                element={<ProtectedRoute role="admin"><AdminUnits /></ProtectedRoute>} />
      <Route path="/admin/units/:id"            element={<ProtectedRoute role="admin"><AdminUnitDetail /></ProtectedRoute>} />
      <Route path="/admin/programmes"           element={<ProtectedRoute role="admin"><AdminProgrammes /></ProtectedRoute>} />
      <Route path="/admin/programmes/create"    element={<ProtectedRoute role="admin"><AdminCreateProg /></ProtectedRoute>} />
      <Route path="/admin/programmes/:id/edit"  element={<ProtectedRoute role="admin"><AdminEditProg /></ProtectedRoute>} />
      <Route path="/admin/announcements"        element={<ProtectedRoute role="admin"><AdminAnnouncements /></ProtectedRoute>} />
      <Route path="/admin/gallery"              element={<ProtectedRoute role="admin"><AdminGallery /></ProtectedRoute>} />
      <Route path="/admin/leaderboard"          element={<ProtectedRoute role="admin"><AdminLeaderboard /></ProtectedRoute>} />

      {/* Unit routes */}
      <Route path="/unit/dashboard"             element={<ProtectedRoute role="unit"><UnitDashboard /></ProtectedRoute>} />
      <Route path="/unit/members"               element={<ProtectedRoute role="unit"><UnitMembers /></ProtectedRoute>} />
      <Route path="/unit/members/add"           element={<ProtectedRoute role="unit"><UnitAddMember /></ProtectedRoute>} />
      <Route path="/unit/members/:id/edit"      element={<ProtectedRoute role="unit"><UnitEditMember /></ProtectedRoute>} />
      <Route path="/unit/programmes"            element={<ProtectedRoute role="unit"><UnitProgrammes /></ProtectedRoute>} />
      <Route path="/unit/blood-members"         element={<ProtectedRoute role="unit"><UnitBloodMembers /></ProtectedRoute>} />
      <Route path="/unit/uploads"               element={<ProtectedRoute role="unit"><UnitUploads /></ProtectedRoute>} />
      <Route path="/unit/gallery"               element={<ProtectedRoute role="unit"><UnitGallery /></ProtectedRoute>} />
      <Route path="/unit/announcements"         element={<ProtectedRoute role="unit"><UnitAnnouncements /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
