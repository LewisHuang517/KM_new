import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/templates/MainLayout'
import { AuthLayout } from './components/templates/AuthLayout'
import {
  Login,
  Dashboard,
  Attendance,
  Children,
  EventLogs,
  VideoPlayback,
  Settings
} from './pages'
import { useAppStore } from './stores/useAppStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore(state => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore(state => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/children" element={<Children />} />
          <Route path="/events" element={<EventLogs />} />
          <Route path="/video" element={<VideoPlayback />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
