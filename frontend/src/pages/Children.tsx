import { useState, useMemo } from 'react'
import { Plus, Upload, MoreVertical, Edit, Trash2, Camera } from 'lucide-react'
import { SearchBar } from '../components/molecules/SearchBar'
import { Select } from '../components/molecules/Select'
import { Button } from '../components/atoms/Button'
import { Badge } from '../components/atoms/Badge'
import { Avatar } from '../components/atoms/Avatar'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { EmptyState } from '../components/feedback/EmptyState'
import { useAppStore } from '../stores/useAppStore'
import { mockChildren, mockClasses } from '../data/mockData'

export function Children() {
  const { addToast } = useAppStore()
  const [search, setSearch] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [openMenu, setOpenMenu] = useState<number | null>(null)

  const filteredChildren = useMemo(() => {
    return mockChildren.filter(child => {
      const matchesSearch = child.name.includes(search) || child.className.includes(search)
      const matchesClass = !selectedClass || child.classId === selectedClass
      return matchesSearch && matchesClass
    })
  }, [search, selectedClass])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_school':
        return <Badge variant="success">在園</Badge>
      case 'left':
        return <Badge variant="warning">離園</Badge>
      case 'absent':
        return <Badge variant="neutral">缺席</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const getPhotoUpdateWarning = (lastUpdate?: string) => {
    if (!lastUpdate) return true
    const daysSince = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince > 30
  }

  const handleDelete = (_id: number) => {
    setShowDeleteConfirm(null)
    setOpenMenu(null)
    addToast({ type: 'success', message: '兒童資料已刪除' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">兒童管理</h1>
          <p className="text-gray-500 mt-1">管理兒童資料與人臉特徵</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Upload className="w-4 h-4" />}>
            匯入 CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            新增
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="搜尋姓名或班級..."
            className="flex-1"
          />
          <Select
            options={[
              { value: '', label: '全部班級' },
              ...mockClasses.map(c => ({ value: c.id, label: c.name }))
            ]}
            value={selectedClass}
            onChange={setSelectedClass}
            className="w-full sm:w-40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredChildren.length === 0 ? (
          <EmptyState
            variant={search || selectedClass ? 'no-results' : 'no-children'}
            action={
              search || selectedClass
                ? { label: '清除篩選', onClick: () => { setSearch(''); setSelectedClass('') } }
                : { label: '新增兒童', onClick: () => setShowAddModal(true) }
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">照片</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">姓名</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">班級</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">狀態</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">照片更新</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredChildren.map(child => (
                  <tr key={child.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Avatar name={child.name} size="md" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{child.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{child.className}</td>
                    <td className="px-4 py-3">{getStatusBadge(child.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {child.lastPhotoUpdate
                            ? new Date(child.lastPhotoUpdate).toLocaleDateString('zh-TW')
                            : '-'
                          }
                        </span>
                        {getPhotoUpdateWarning(child.lastPhotoUpdate) && (
                          <Badge variant="warning" dot={false}>需更新</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenMenu(openMenu === child.id ? null : child.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenu === child.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenu(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border py-1 z-20">
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => setOpenMenu(null)}
                              >
                                <Edit className="w-4 h-4" />
                                編輯
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => setOpenMenu(null)}
                              >
                                <Camera className="w-4 h-4" />
                                更新照片
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                onClick={() => {
                                  setShowDeleteConfirm(child.id)
                                  setOpenMenu(null)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                刪除
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredChildren.length > 0 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">
              顯示 1-{filteredChildren.length}，共 {filteredChildren.length} 筆
            </span>
            <div className="flex gap-1">
              <button className="px-3 py-1 rounded border bg-sky-600 text-white">1</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">新增兒童</h2>
            <p className="text-gray-500 mb-6">Demo 模式 - 表單功能待實作</p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>取消</Button>
              <Button onClick={() => {
                setShowAddModal(false)
                addToast({ type: 'success', message: '兒童已新增（Demo）' })
              }}>確認</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm !== null}
        title="確認刪除"
        message={`確定要刪除「${mockChildren.find(c => c.id === showDeleteConfirm)?.name}」的資料嗎？此操作無法復原。`}
        confirmLabel="刪除"
        variant="danger"
        onConfirm={() => handleDelete(showDeleteConfirm!)}
        onCancel={() => setShowDeleteConfirm(null)}
      />
    </div>
  )
}
