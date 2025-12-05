import { useState } from 'react'
import { Users, UserCheck, UserMinus, AlertTriangle, ChevronRight, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatsCard } from '../components/organisms/StatsCard'
import { Badge } from '../components/atoms/Badge'
import { mockDashboardStats, mockEvents, mockCameras } from '../data/mockData'

export function Dashboard() {
  const [selectedCamera, setSelectedCamera] = useState(mockCameras[0].id)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    }
    return '昨日 ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'entry':
        return <Badge variant="success">入園</Badge>
      case 'exit':
        return <Badge variant="warning">離園</Badge>
      case 'warning':
        return <Badge variant="warning">警告</Badge>
      case 'alert':
        return <Badge variant="danger">警報</Badge>
      default:
        return <Badge variant="neutral">未知</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">主控台</h1>
        <p className="text-gray-500 mt-1">即時監控與統計總覽</p>
      </div>

      {/* Live camera feed */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-gray-400" />
            即時攝影機畫面
          </h2>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500"
          >
            {mockCameras.map(camera => (
              <option key={camera.id} value={camera.id}>{camera.name}</option>
            ))}
          </select>
        </div>

        <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
          {/* Simulated camera feed */}
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-12 h-12 text-gray-600" />
            </div>
            <p className="text-gray-400">攝影機預覽畫面</p>
            <p className="text-gray-500 text-sm mt-1">Demo 模式 - 無實際串流</p>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-white text-sm font-medium">
                {mockCameras.find(c => c.id === selectedCamera)?.name}
              </p>
              <p className="text-gray-300 text-xs">即時串流中</p>
            </div>

            <div className="bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">辨識中</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="應到人數"
          value={mockDashboardStats.expected}
          unit="人"
          variant="default"
          icon={<Users className="w-5 h-5" />}
        />
        <StatsCard
          title="實到人數"
          value={mockDashboardStats.present}
          unit="人"
          variant="success"
          icon={<UserCheck className="w-5 h-5" />}
        />
        <StatsCard
          title="已離園"
          value={mockDashboardStats.left}
          unit="人"
          variant="warning"
          icon={<UserMinus className="w-5 h-5" />}
        />
        <StatsCard
          title="今日警報"
          value={mockDashboardStats.alertsToday}
          unit="次"
          variant={mockDashboardStats.alertsToday > 0 ? 'danger' : 'info'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Recent events */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">最新動態</h2>
          <Link
            to="/events"
            className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y">
          {mockEvents.slice(0, 6).map(event => (
            <div
              key={event.id}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-16">
                  {formatTime(event.timestamp)}
                </span>
                <span className="font-medium text-gray-900">
                  {event.childName || '未知人員'}
                </span>
                {getEventBadge(event.eventType)}
              </div>
              <span className="text-sm text-gray-500">{event.cameraName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
