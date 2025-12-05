export interface Child {
  id: number
  name: string
  classId: string
  className: string
  status: 'in_school' | 'left' | 'absent'
  photoUrl?: string
  guardianName?: string
  guardianPhone?: string
  signInTime?: string
  signOutTime?: string
  lastPhotoUpdate?: string
}

export interface AttendanceRecord {
  childId: number
  childName: string
  className: string
  status: 'signed_in' | 'signed_out' | 'not_signed'
  signInTime?: string
  signOutTime?: string
  photoUrl?: string
}

export interface EventLog {
  id: number
  timestamp: string
  childId?: number
  childName?: string
  className?: string
  eventType: 'entry' | 'exit' | 'warning' | 'alert'
  cameraId: string
  cameraName: string
  confidence?: number
  screenshotUrl?: string
}

export interface Alert {
  id: number
  level: 'high' | 'low'
  type: string
  message: string
  timestamp: string
  childId?: number
  childName?: string
  className?: string
  cameraId: string
  cameraName: string
  screenshotUrl?: string
  status: 'active' | 'dismissed'
  dismissedBy?: string
  dismissedAt?: string
}

export interface Camera {
  id: string
  name: string
  rtspUrl: string
  zone: 'entrance' | 'perimeter' | 'playground'
  status: 'online' | 'offline'
}

export interface User {
  id: number
  username: string
  role: 'admin' | 'staff'
  displayName: string
}

export interface SystemStatus {
  nas: 'online' | 'offline'
  cameras: {
    total: number
    online: number
  }
  overrideMode: {
    active: boolean
    reason?: string
    remainingMinutes?: number
    activatedBy?: string
    activatedAt?: string
  }
}

export interface DashboardStats {
  expected: number
  present: number
  left: number
  alertsToday: number
}
