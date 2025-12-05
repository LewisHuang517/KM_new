import { useState, useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { SearchBar } from '../components/molecules/SearchBar'
import { Select } from '../components/molecules/Select'
import { Button } from '../components/atoms/Button'
import { Badge } from '../components/atoms/Badge'
import { Avatar } from '../components/atoms/Avatar'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { useAppStore } from '../stores/useAppStore'
import { mockAttendance, mockClasses } from '../data/mockData'

export function Attendance() {
  const { addToast } = useAppStore()
  const [search, setSearch] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  const filteredRecords = useMemo(() => {
    return mockAttendance.filter(record => {
      const matchesSearch = record.childName.includes(search)
      const matchesClass = !selectedClass || record.className === selectedClass
      const matchesStatus = !statusFilter || record.status === statusFilter
      return matchesSearch && matchesClass && matchesStatus
    })
  }, [search, selectedClass, statusFilter])

  const groupedByClass = useMemo(() => {
    const groups: Record<string, typeof filteredRecords> = {}
    filteredRecords.forEach(record => {
      if (!groups[record.className]) {
        groups[record.className] = []
      }
      groups[record.className].push(record)
    })
    return groups
  }, [filteredRecords])

  const handleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSignOut = (_id: number) => {
    addToast({ type: 'success', message: '簽退成功' })
  }

  const handleBatchSignOut = () => {
    setShowConfirm(false)
    setSelectedIds([])
    addToast({ type: 'success', message: `已為 ${selectedIds.length} 位兒童完成簽退` })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed_in':
        return <Badge variant="success">已簽到</Badge>
      case 'signed_out':
        return <Badge variant="warning">已簽退</Badge>
      case 'not_signed':
        return <Badge variant="neutral">未簽到</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getCardBg = (status: string) => {
    switch (status) {
      case 'signed_in':
        return 'bg-green-50 border-green-200'
      case 'signed_out':
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">今日出勤</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="搜尋兒童姓名..."
            className="flex-1"
          />
          <Select
            options={[
              { value: '', label: '全部班級' },
              ...mockClasses.map(c => ({ value: c.name, label: c.name }))
            ]}
            value={selectedClass}
            onChange={setSelectedClass}
            className="w-full sm:w-40"
          />
          <Select
            options={[
              { value: '', label: '全部狀態' },
              { value: 'signed_in', label: '已簽到' },
              { value: 'signed_out', label: '已簽退' },
              { value: 'not_signed', label: '未簽到' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full sm:w-40"
          />
        </div>
      </div>

      {/* Attendance grid by class */}
      <div className="space-y-6">
        {Object.entries(groupedByClass).map(([className, records]) => (
          <div key={className}>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              班級：{className}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {records.map(record => (
                <div
                  key={record.childId}
                  className={`
                    relative rounded-xl border p-4
                    transition-all duration-150
                    ${getCardBg(record.status)}
                    ${selectedIds.includes(record.childId) ? 'ring-2 ring-sky-500' : ''}
                  `}
                >
                  {/* Checkbox */}
                  {record.status === 'signed_in' && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.childId)}
                      onChange={() => handleSelect(record.childId)}
                      className="absolute top-3 right-3 w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                    />
                  )}

                  {/* Content */}
                  <div className="text-center">
                    <Avatar name={record.childName} size="xl" className="mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900">{record.childName}</h3>
                    <div className="mt-2">{getStatusBadge(record.status)}</div>
                    <p className="text-sm text-gray-500 mt-1">
                      {record.status === 'signed_in' && record.signInTime}
                      {record.status === 'signed_out' && record.signOutTime}
                      {record.status === 'not_signed' && '--'}
                    </p>

                    {record.status === 'signed_in' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3"
                        onClick={() => handleSignOut(record.childId)}
                      >
                        簽退
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Batch action bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 lg:ml-60">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-gray-600">
              已選擇 <strong>{selectedIds.length}</strong> 人
            </span>
            <Button onClick={() => setShowConfirm(true)}>
              批次簽退
            </Button>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="確認批次簽退"
        message={`確定要為 ${selectedIds.length} 位兒童進行簽退嗎？`}
        confirmLabel="確認簽退"
        variant="warning"
        onConfirm={handleBatchSignOut}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
