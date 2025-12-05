import type { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: number
  unit?: string
  icon?: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variantStyles = {
  default: 'bg-gray-50',
  success: 'bg-green-50',
  warning: 'bg-amber-50',
  danger: 'bg-red-50',
  info: 'bg-sky-50',
}

const valueStyles = {
  default: 'text-gray-900',
  success: 'text-green-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  info: 'text-sky-700',
}

export function StatsCard({
  title,
  value,
  unit = '',
  icon,
  variant = 'default',
  className = ''
}: StatsCardProps) {
  return (
    <div
      className={`
        rounded-xl p-4
        ${variantStyles[variant]}
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-bold ${valueStyles[variant]}`}>
          {value}
        </span>
        {unit && <span className="text-lg text-gray-500">{unit}</span>}
      </div>
    </div>
  )
}
