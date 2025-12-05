import { AlertTriangle, X, Eye } from 'lucide-react'
import type { Alert } from '../../types'

interface AlertBannerProps {
  alert: Alert | null
  onDismiss: (alertId: number) => void
  onView?: (alertId: number) => void
}

export function AlertBanner({ alert, onDismiss, onView }: AlertBannerProps) {
  if (!alert || alert.level !== 'low') return null

  return (
    <div
      className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between animate-slide-in"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">
          注意：{alert.message} 於 {alert.cameraName} {new Date(alert.timestamp).toLocaleTimeString('zh-TW')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onView && (
          <button
            onClick={() => onView(alert.id)}
            className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded transition-colors flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            查看
          </button>
        )}
        <button
          onClick={() => onDismiss(alert.id)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="關閉警報"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
