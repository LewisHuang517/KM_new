import { useState } from 'react'
import { Camera, HardDrive, Shield, Users, Wifi, WifiOff, Play, Edit2, Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/atoms/Button'
import { Input } from '../components/atoms/Input'
import { Badge } from '../components/atoms/Badge'
import { Select } from '../components/molecules/Select'
import { ConfirmDialog } from '../components/feedback/ConfirmDialog'
import { useAppStore } from '../stores/useAppStore'
import { mockCameras } from '../data/mockData'

type TabId = 'cameras' | 'nas' | 'override' | 'accounts'

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'cameras', label: '攝影機', icon: <Camera className="w-4 h-4" /> },
  { id: 'nas', label: 'NAS', icon: <HardDrive className="w-4 h-4" /> },
  { id: 'override', label: 'Override', icon: <Shield className="w-4 h-4" /> },
  { id: 'accounts', label: '帳號', icon: <Users className="w-4 h-4" /> },
]

export function Settings() {
  const { systemStatus, setSystemStatus, addToast } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabId>('cameras')

  // Override form state
  const [overrideDuration, setOverrideDuration] = useState('30')
  const [overrideReason, setOverrideReason] = useState('')
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const handleActivateOverride = () => {
    if (!overrideReason.trim()) {
      addToast({ type: 'warning', message: '請輸入啟用原因' })
      return
    }

    setSystemStatus({
      overrideMode: {
        active: true,
        reason: overrideReason,
        remainingMinutes: parseInt(overrideDuration),
        activatedBy: '管理員',
        activatedAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      }
    })
    addToast({ type: 'info', message: `Override 模式已啟用 ${overrideDuration} 分鐘` })
    setOverrideReason('')
  }

  const handleEndOverride = () => {
    setSystemStatus({
      overrideMode: { active: false }
    })
    setShowEndConfirm(false)
    addToast({ type: 'success', message: 'Override 模式已結束' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系統設定</h1>
        <p className="text-gray-500 mt-1">管理攝影機、NAS 與系統設定</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium
                border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl shadow-sm">
        {/* Cameras Tab */}
        {activeTab === 'cameras' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">攝影機設定</h2>
              <Button size="sm" icon={<Plus className="w-4 h-4" />}>新增攝影機</Button>
            </div>

            {mockCameras.map(camera => (
              <div key={camera.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{camera.name} ({camera.id})</h3>
                    <Badge variant={camera.status === 'online' ? 'success' : 'danger'}>
                      {camera.status === 'online' ? '連線中' : '離線'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={<Play className="w-4 h-4" />}>測試</Button>
                    <Button variant="ghost" size="sm" icon={<Edit2 className="w-4 h-4" />}>編輯</Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>RTSP URL: <code className="bg-gray-100 px-2 py-0.5 rounded">{camera.rtspUrl}</code></p>
                  <p>區域: {camera.zone}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NAS Tab */}
        {activeTab === 'nas' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">NAS 設定</h2>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${systemStatus.nas === 'online' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {systemStatus.nas === 'online'
                      ? <Wifi className="w-5 h-5 text-green-600" />
                      : <WifiOff className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Synology NAS</h3>
                    <p className="text-sm text-gray-500">192.168.1.100:5000</p>
                  </div>
                </div>
                <Badge variant={systemStatus.nas === 'online' ? 'success' : 'danger'}>
                  {systemStatus.nas === 'online' ? '連線正常' : '連線中斷'}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input label="主機位址" defaultValue="192.168.1.100" />
                <Input label="連接埠" defaultValue="5000" />
                <Input label="使用者名稱" defaultValue="admin" />
                <Input label="密碼" type="password" defaultValue="••••••••" />
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="secondary">測試連線</Button>
                <Button>儲存設定</Button>
              </div>
            </div>
          </div>
        )}

        {/* Override Tab */}
        {activeTab === 'override' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Override 模式控制</h2>

            {systemStatus.overrideMode.active ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">Override 模式啟用中</h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">剩餘時間</span>
                    <span className="font-medium text-purple-900">{systemStatus.overrideMode.remainingMinutes} 分鐘</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${((systemStatus.overrideMode.remainingMinutes || 0) / 30) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">原因</span>
                    <span className="text-purple-900">{systemStatus.overrideMode.reason}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">啟用者</span>
                    <span className="text-purple-900">{systemStatus.overrideMode.activatedBy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-700">啟用時間</span>
                    <span className="text-purple-900">{systemStatus.overrideMode.activatedAt}</span>
                  </div>
                </div>

                <Button variant="danger" className="w-full" onClick={() => setShowEndConfirm(true)}>
                  立即結束 Override
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-gray-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Override 模式</h3>
                    <p className="text-sm text-gray-500">啟用後，系統將暫停高風險警報</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  適用於：校外教學、團體活動、特殊情況
                </p>

                <div className="space-y-4 mb-6">
                  <Select
                    label="持續時間"
                    options={[
                      { value: '15', label: '15 分鐘' },
                      { value: '30', label: '30 分鐘' },
                      { value: '60', label: '1 小時' },
                      { value: '120', label: '2 小時' },
                    ]}
                    value={overrideDuration}
                    onChange={setOverrideDuration}
                  />

                  <Input
                    label="原因說明"
                    placeholder="例：戶外教學活動"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    required
                  />
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-500"
                  onClick={handleActivateOverride}
                  icon={<Shield className="w-4 h-4" />}
                >
                  啟用 Override
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">帳號管理</h2>
              <Button size="sm" icon={<Plus className="w-4 h-4" />}>新增帳號</Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">帳號</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">角色</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">狀態</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">admin</p>
                        <p className="text-sm text-gray-500">系統管理員</p>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="purple" dot={false}>Admin</Badge></td>
                    <td className="px-4 py-3"><Badge variant="success">啟用</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" icon={<Edit2 className="w-4 h-4" />}>編輯</Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">teacher1</p>
                        <p className="text-sm text-gray-500">李老師</p>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="info" dot={false}>Staff</Badge></td>
                    <td className="px-4 py-3"><Badge variant="success">啟用</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" icon={<Edit2 className="w-4 h-4" />}>編輯</Button>
                        <Button variant="ghost" size="sm" className="text-red-600" icon={<Trash2 className="w-4 h-4" />}>刪除</Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* End Override Confirm */}
      <ConfirmDialog
        isOpen={showEndConfirm}
        title="結束 Override 模式"
        message="確定要立即結束 Override 模式嗎？系統將恢復正常警報功能。"
        confirmLabel="結束"
        variant="danger"
        onConfirm={handleEndOverride}
        onCancel={() => setShowEndConfirm(false)}
      />
    </div>
  )
}
