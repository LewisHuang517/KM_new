import { useEffect, useRef } from 'react'
import { AlertTriangle, X, Video } from 'lucide-react'
import { Button } from '../atoms/Button'
import type { Alert } from '../../types'

interface AlertModalProps {
  alert: Alert | null
  onDismiss: (alertId: number) => void
  onViewVideo?: (alertId: number) => void
}

export function AlertModal({ alert, onDismiss, onViewVideo }: AlertModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (alert && alert.level === 'high') {
      modalRef.current?.focus()
    }
  }, [alert])

  if (!alert || alert.level !== 'high') return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby="alert-desc"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-pulse-slow"
        style={{ boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.5)' }}
      >
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h2 id="alert-title" className="text-xl font-bold">
                緊急警報：異常離場偵測！
              </h2>
              <p className="text-red-100 text-sm">請立即確認</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Screenshot placeholder */}
          <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-6">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl">👤</span>
              </div>
              <p className="text-sm">即時截圖</p>
            </div>
          </div>

          {/* Details */}
          <div id="alert-desc" className="space-y-3 text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span>地點：{alert.cameraName}</span>
            </div>
            {alert.childName && (
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span>對象：{alert.childName} {alert.className && `(${alert.className})`}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-lg">🕐</span>
              <span>時間：{new Date(alert.timestamp).toLocaleTimeString('zh-TW')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 flex gap-3">
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => onDismiss(alert.id)}
            icon={<X className="w-4 h-4" />}
          >
            解除警報
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onViewVideo?.(alert.id)}
            icon={<Video className="w-4 h-4" />}
          >
            影像回溯
          </Button>
        </div>
      </div>
    </div>
  )
}
