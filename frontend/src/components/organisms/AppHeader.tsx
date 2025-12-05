import { Menu, Bell, User, LogOut } from 'lucide-react'
import { StatusIndicator } from '../molecules/StatusIndicator'
import { useState } from 'react'

interface AppHeaderProps {
  onMenuClick?: () => void
  nasStatus: 'online' | 'offline'
  cameraStatus: 'online' | 'offline' | 'warning'
  userName?: string
  onLogout?: () => void
}

export function AppHeader({
  onMenuClick,
  nasStatus,
  cameraStatus,
  userName = '管理員',
  onLogout
}: AppHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">KG</span>
          </div>
          <span className="font-semibold text-gray-900 hidden sm:block">KindyGuard</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4">
          <StatusIndicator status={nasStatus} label="NAS" />
          <StatusIndicator status={cameraStatus} label="攝影機" />
        </div>

        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:block text-sm font-medium">{userName}</span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    onLogout?.()
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  登出
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
