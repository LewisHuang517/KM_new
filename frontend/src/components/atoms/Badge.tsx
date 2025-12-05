import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  dot?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  success: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  danger: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  info: { bg: 'bg-sky-100', text: 'text-sky-800', dot: 'bg-sky-500' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
}

export function Badge({ variant = 'neutral', children, dot = true, className = '' }: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        text-sm font-medium
        rounded-full
        ${styles.bg} ${styles.text}
        ${className}
      `}
    >
      {dot && <span className={`w-2 h-2 rounded-full ${styles.dot}`} />}
      {children}
    </span>
  )
}
