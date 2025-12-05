import { Outlet } from 'react-router-dom'
import { AppHeader } from '../organisms/AppHeader'
import { AppSidebar } from '../organisms/AppSidebar'
import { AlertModal } from '../organisms/AlertModal'
import { AlertBanner } from '../organisms/AlertBanner'
import { ToastContainer } from '../feedback/Toast'
import { useAppStore } from '../../stores/useAppStore'

export function MainLayout() {
  const {
    sidebarOpen,
    setSidebarOpen,
    systemStatus,
    activeAlert,
    setActiveAlert,
    toasts,
    removeToast,
    logout,
    user
  } = useAppStore()

  const handleDismissAlert = () => {
    setActiveAlert(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Low risk alert banner */}
      <AlertBanner
        alert={activeAlert?.level === 'low' ? activeAlert : null}
        onDismiss={handleDismissAlert}
      />

      {/* Header */}
      <AppHeader
        onMenuClick={() => setSidebarOpen(true)}
        nasStatus={systemStatus.nas}
        cameraStatus={systemStatus.cameras.online === systemStatus.cameras.total ? 'online' : 'warning'}
        userName={user?.displayName}
        onLogout={logout}
      />

      <div className="flex">
        {/* Sidebar */}
        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          overrideActive={systemStatus.overrideMode.active}
        />

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* High risk alert modal */}
      <AlertModal
        alert={activeAlert?.level === 'high' ? activeAlert : null}
        onDismiss={handleDismissAlert}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
