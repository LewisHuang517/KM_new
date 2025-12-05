import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UserCheck,
  Users,
  FileText,
  Video,
  Settings,
  X,
  Shield
} from 'lucide-react'

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
  overrideActive?: boolean
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '主控台' },
  { to: '/attendance', icon: UserCheck, label: '出勤管理' },
  { to: '/children', icon: Users, label: '兒童管理' },
  { to: '/events', icon: FileText, label: '事件日誌' },
  { to: '/video', icon: Video, label: '影像回溯' },
  { to: '/settings', icon: Settings, label: '系統設定' },
]

export function AppSidebar({ isOpen, onClose, overrideActive }: AppSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0
          w-60 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          z-50 lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">KG</span>
            </div>
            <span className="font-semibold text-gray-900">KindyGuard</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium
                transition-colors duration-150
                ${isActive
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {overrideActive && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-700">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Override 模式啟用中</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
