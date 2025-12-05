import { useState, useMemo } from 'react'
import { Calendar, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react'
import { Select } from '../components/molecules/Select'
import { Button } from '../components/atoms/Button'
import { Badge } from '../components/atoms/Badge'
import { EmptyState } from '../components/feedback/EmptyState'
import { mockEvents, mockCameras, mockChildren } from '../data/mockData'

export function VideoPlayback() {
  const [search] = useState('')
  const [childId, setChildId] = useState('')
  const [eventType, setEventType] = useState('')
  const [cameraId, setCameraId] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<typeof mockEvents[0] | null>(null)

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(3)
  const [duration] = useState(10)

  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      const matchesSearch = !search ||
        event.childName?.includes(search) ||
        event.cameraName.includes(search)
      const matchesChild = !childId || event.childId?.toString() === childId
      const matchesType = !eventType || event.eventType === eventType
      const matchesCamera = !cameraId || event.cameraId === cameraId
      return matchesSearch && matchesChild && matchesType && matchesCamera
    })
  }, [search, childId, eventType, cameraId])

  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatEventTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'entry':
        return <Badge variant="success" dot={false}>入園</Badge>
      case 'exit':
        return <Badge variant="warning" dot={false}>離園</Badge>
      case 'warning':
        return <Badge variant="warning" dot={false}>警告</Badge>
      case 'alert':
        return <Badge variant="danger" dot={false}>警報</Badge>
      default:
        return <Badge variant="neutral" dot={false}>未知</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">影像回溯</h1>
        <p className="text-gray-500 mt-1">搜尋與播放歷史錄影</p>
      </div>

      {/* Search filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <Select
            options={[
              { value: '', label: '全部兒童' },
              ...mockChildren.map(c => ({ value: c.id.toString(), label: c.name }))
            ]}
            value={childId}
            onChange={setChildId}
            className="w-full lg:w-40"
          />
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
            className="w-full lg:w-32"
          />
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 w-full lg:w-auto">
            <Calendar className="w-4 h-4" />
            今日
          </div>
          <Select
            options={[
              { value: '', label: '全部攝影機' },
              ...mockCameras.map(c => ({ value: c.id, label: c.name }))
            ]}
            value={cameraId}
            onChange={setCameraId}
            className="w-full lg:w-36"
          />
          <Button>搜尋</Button>
        </div>
      </div>

      {/* Video player */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="aspect-video bg-gray-900 relative">
          {selectedEvent ? (
            <>
              {/* Video content placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="text-gray-400">影片播放區</p>
                  <p className="text-gray-500 text-sm mt-1">Demo 模式 - 無實際影片</p>
                </div>
              </div>

              {/* Video controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="relative h-1 bg-gray-600 rounded-full cursor-pointer">
                    <div
                      className="absolute h-full bg-sky-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div
                      className="absolute w-3 h-3 bg-white rounded-full -top-1 shadow"
                      style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-6px' }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
                      className="p-2 text-white hover:bg-white/20 rounded-lg"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 text-white hover:bg-white/20 rounded-lg"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
                      className="p-2 text-white hover:bg-white/20 rounded-lg"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>

                    <span className="text-white text-sm ml-2">
                      {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-white hover:bg-white/20 rounded-lg"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button className="p-2 text-white hover:bg-white/20 rounded-lg">
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Source info */}
                <div className="mt-2 text-gray-400 text-xs">
                  來源：Synology NAS
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>請從下方列表選擇事件播放</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search results */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">搜尋結果</h2>
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyState
            variant="no-results"
            action={{ label: '清除篩選', onClick: () => { setChildId(''); setEventType(''); setCameraId('') } }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">時間</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">兒童</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">類型</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">攝影機</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEvents.map(event => (
                  <tr
                    key={event.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedEvent?.id === event.id ? 'bg-sky-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatEventTime(event.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {event.childName || '未知人員'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getEventBadge(event.eventType)}</td>
                    <td className="px-4 py-3 text-gray-600">{event.cameraName}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(event)}
                        icon={<Play className="w-4 h-4" />}
                      >
                        播放
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
