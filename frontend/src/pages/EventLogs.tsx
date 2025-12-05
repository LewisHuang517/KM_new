import { useState, useMemo } from 'react'
import { Calendar, ChevronRight, X, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SearchBar } from '../components/molecules/SearchBar'
import { Select } from '../components/molecules/Select'
import { Button } from '../components/atoms/Button'
import { Badge } from '../components/atoms/Badge'
import { EmptyState } from '../components/feedback/EmptyState'
import { mockEvents, mockCameras } from '../data/mockData'

export function EventLogs() {
  const [search, setSearch] = useState('')
  const [eventType, setEventType] = useState('')
  const [cameraId, setCameraId] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<typeof mockEvents[0] | null>(null)

  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      const matchesSearch = !search ||
        event.childName?.includes(search) ||
        event.cameraName.includes(search)
      const matchesType = !eventType || event.eventType === eventType
      const matchesCamera = !cameraId || event.cameraId === cameraId
      return matchesSearch && matchesType && matchesCamera
    })
  }, [search, eventType, cameraId])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    const time = date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    if (isToday) return time
    return `昨日 ${time}`
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">事件日誌</h1>
        <p className="text-gray-500 mt-1">查看所有辨識與警報事件</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="搜尋兒童或攝影機..."
            className="flex-1"
          />
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              今日
            </div>
            <Select
              options={[
                { value: '', label: '全部類型' },
                { value: 'entry', label: '入園' },
                { value: 'exit', label: '離園' },
                { value: 'warning', label: '警告' },
                { value: 'alert', label: '警報' },
              ]}
              value={eventType}
              onChange={setEventType}
              className="w-32"
            />
            <Select
              options={[
                { value: '', label: '全部攝影機' },
                ...mockCameras.map(c => ({ value: c.id, label: c.name }))
              ]}
              value={cameraId}
              onChange={setCameraId}
              className="w-36"
            />
            <Button variant="secondary">搜尋</Button>
          </div>
        </div>
      </div>

      {/* Table with detail drawer */}
      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white rounded-xl shadow-sm overflow-hidden flex-1 transition-all ${selectedEvent ? 'lg:mr-80' : ''}`}>
          {filteredEvents.length === 0 ? (
            <EmptyState
              variant="no-results"
              action={{ label: '清除篩選', onClick: () => { setSearch(''); setEventType(''); setCameraId('') } }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">時間</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">兒童</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">事件類型</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">攝影機</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEvents.map(event => (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`
                        hover:bg-gray-50 transition-colors cursor-pointer
                        ${selectedEvent?.id === event.id ? 'bg-sky-50' : ''}
                      `}
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatTime(event.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {event.childName || '未知人員'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getEventBadge(event.eventType)}</td>
                      <td className="px-4 py-3 text-gray-600">{event.cameraName}</td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-400 inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredEvents.length > 0 && (
            <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
              <span className="text-gray-500">
                顯示 1-{filteredEvents.length}，共 {filteredEvents.length} 筆
              </span>
              <div className="flex gap-1">
                <button className="px-3 py-1 rounded border bg-sky-600 text-white">1</button>
              </div>
            </div>
          )}
        </div>

        {/* Detail drawer */}
        {selectedEvent && (
          <div className="fixed lg:absolute right-0 top-0 bottom-0 w-80 bg-white border-l shadow-lg z-30 overflow-y-auto lg:top-auto lg:bottom-auto lg:h-auto lg:rounded-xl">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">事件詳情</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Screenshot */}
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">📷</span>
                  </div>
                  <p className="text-sm">截圖預覽</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">事件類型</span>
                  <span>{getEventBadge(selectedEvent.eventType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">時間</span>
                  <span className="text-gray-900">{formatTime(selectedEvent.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">兒童</span>
                  <span className="text-gray-900">{selectedEvent.childName || '未知'}</span>
                </div>
                {selectedEvent.className && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">班級</span>
                    <span className="text-gray-900">{selectedEvent.className}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">攝影機</span>
                  <span className="text-gray-900">{selectedEvent.cameraName}</span>
                </div>
                {selectedEvent.confidence && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">信心度</span>
                    <span className="text-gray-900">{selectedEvent.confidence}%</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <Link to="/video">
                <Button variant="secondary" className="w-full" icon={<Play className="w-4 h-4" />}>
                  播放影像回溯
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
