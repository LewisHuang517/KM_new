import { create } from 'zustand'
import type { Alert, SystemStatus, User } from '../types'
import type { ToastData } from '../components/feedback/Toast'

interface AppState {
  // User
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void

  // System status
  systemStatus: SystemStatus
  setSystemStatus: (status: Partial<SystemStatus>) => void

  // Alerts
  activeAlert: Alert | null
  setActiveAlert: (alert: Alert | null) => void

  // Toast notifications
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => void
  removeToast: (id: string) => void

  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // User
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),

  // System status
  systemStatus: {
    nas: 'online',
    cameras: { total: 2, online: 2 },
    overrideMode: { active: false },
  },
  setSystemStatus: (status) =>
    set((state) => ({ systemStatus: { ...state.systemStatus, ...status } })),

  // Alerts
  activeAlert: null,
  setActiveAlert: (alert) => set({ activeAlert: alert }),

  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Sidebar
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
