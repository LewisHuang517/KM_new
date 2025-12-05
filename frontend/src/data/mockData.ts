import type { Child, AttendanceRecord, EventLog, Alert, Camera, SystemStatus, DashboardStats } from '../types'

export const mockChildren: Child[] = [
  { id: 1, name: '王小明', classId: 'A1', className: '小班A', status: 'in_school', signInTime: '09:15', photoUrl: '', guardianName: '王爸爸', guardianPhone: '0912-345-678', lastPhotoUpdate: '2025-01-24' },
  { id: 2, name: '李小花', classId: 'A1', className: '小班A', status: 'in_school', signInTime: '09:12', photoUrl: '', guardianName: '李媽媽', guardianPhone: '0923-456-789', lastPhotoUpdate: '2025-01-20' },
  { id: 3, name: '張小華', classId: 'A1', className: '小班A', status: 'absent', photoUrl: '', guardianName: '張爸爸', guardianPhone: '0934-567-890', lastPhotoUpdate: '2025-01-22' },
  { id: 4, name: '陳小強', classId: 'A1', className: '小班A', status: 'left', signInTime: '08:30', signOutTime: '16:30', photoUrl: '', guardianName: '陳媽媽', guardianPhone: '0945-678-901', lastPhotoUpdate: '2025-01-25' },
  { id: 5, name: '林小美', classId: 'A2', className: '小班B', status: 'in_school', signInTime: '09:05', photoUrl: '', guardianName: '林爸爸', guardianPhone: '0956-789-012', lastPhotoUpdate: '2025-01-23' },
  { id: 6, name: '黃小安', classId: 'A2', className: '小班B', status: 'in_school', signInTime: '09:08', photoUrl: '', guardianName: '黃媽媽', guardianPhone: '0967-890-123', lastPhotoUpdate: '2025-01-21' },
  { id: 7, name: '吳小傑', classId: 'B1', className: '中班A', status: 'in_school', signInTime: '08:55', photoUrl: '', guardianName: '吳爸爸', guardianPhone: '0978-901-234', lastPhotoUpdate: '2025-01-24' },
  { id: 8, name: '周小玲', classId: 'B1', className: '中班A', status: 'in_school', signInTime: '09:00', photoUrl: '', guardianName: '周媽媽', guardianPhone: '0989-012-345', lastPhotoUpdate: '2025-01-19' },
]

export const mockAttendance: AttendanceRecord[] = mockChildren.map(child => ({
  childId: child.id,
  childName: child.name,
  className: child.className,
  status: child.status === 'in_school' ? 'signed_in' : child.status === 'left' ? 'signed_out' : 'not_signed',
  signInTime: child.signInTime,
  signOutTime: child.signOutTime,
  photoUrl: child.photoUrl
}))

export const mockEvents: EventLog[] = [
  { id: 1, timestamp: '2025-01-26T09:15:30', childId: 1, childName: '王小明', className: '小班A', eventType: 'entry', cameraId: 'C1', cameraName: '入口攝影機', confidence: 98, screenshotUrl: '' },
  { id: 2, timestamp: '2025-01-26T09:12:22', childId: 2, childName: '李小花', className: '小班A', eventType: 'entry', cameraId: 'C1', cameraName: '入口攝影機', confidence: 96, screenshotUrl: '' },
  { id: 3, timestamp: '2025-01-26T09:10:05', childName: '未知人員', eventType: 'warning', cameraId: 'C1', cameraName: '入口攝影機', screenshotUrl: '' },
  { id: 4, timestamp: '2025-01-26T09:08:15', childId: 5, childName: '林小美', className: '小班B', eventType: 'entry', cameraId: 'C1', cameraName: '入口攝影機', confidence: 99, screenshotUrl: '' },
  { id: 5, timestamp: '2025-01-26T09:05:40', childId: 6, childName: '黃小安', className: '小班B', eventType: 'entry', cameraId: 'C1', cameraName: '入口攝影機', confidence: 97, screenshotUrl: '' },
  { id: 6, timestamp: '2025-01-25T16:30:00', childId: 4, childName: '陳小強', className: '小班A', eventType: 'exit', cameraId: 'C1', cameraName: '入口攝影機', confidence: 95, screenshotUrl: '' },
  { id: 7, timestamp: '2025-01-25T15:45:20', childId: 3, childName: '張小華', className: '小班A', eventType: 'alert', cameraId: 'C2', cameraName: '週界攝影機', confidence: 92, screenshotUrl: '' },
]

export const mockAlerts: Alert[] = [
  {
    id: 1,
    level: 'low',
    type: 'unknown_person',
    message: '偵測到未知人員',
    timestamp: '2025-01-26T09:10:05',
    cameraId: 'C1',
    cameraName: '入口攝影機',
    screenshotUrl: '',
    status: 'active'
  }
]

export const mockCameras: Camera[] = [
  { id: 'C1', name: '入口攝影機', rtspUrl: 'rtsp://192.168.1.101:554/stream1', zone: 'entrance', status: 'online' },
  { id: 'C2', name: '週界攝影機', rtspUrl: 'rtsp://192.168.1.102:554/stream1', zone: 'perimeter', status: 'online' },
]

export const mockSystemStatus: SystemStatus = {
  nas: 'online',
  cameras: { total: 2, online: 2 },
  overrideMode: { active: false }
}

export const mockDashboardStats: DashboardStats = {
  expected: 25,
  present: 23,
  left: 5,
  alertsToday: 1
}

export const mockClasses = [
  { id: 'A1', name: '小班A' },
  { id: 'A2', name: '小班B' },
  { id: 'B1', name: '中班A' },
  { id: 'B2', name: '中班B' },
  { id: 'C1', name: '大班A' },
  { id: 'C2', name: '大班B' },
]
