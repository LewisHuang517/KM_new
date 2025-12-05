interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning'
  label: string
  className?: string
}

const statusConfig = {
  online: { dot: 'bg-green-500', text: 'text-green-700', label: '正常' },
  offline: { dot: 'bg-red-500', text: 'text-red-700', label: '離線' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-700', label: '警告' },
}

export function StatusIndicator({ status, label, className = '' }: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${status === 'online' ? 'animate-pulse' : ''}`} />
      <span className={`font-medium ${config.text}`}>{label}</span>
    </div>
  )
}
