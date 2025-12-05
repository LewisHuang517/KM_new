import { User } from 'lucide-react'

interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizeStyles[size]} rounded-full object-cover bg-gray-100 ${className}`}
      />
    )
  }

  if (initials) {
    return (
      <div
        className={`
          ${sizeStyles[size]}
          rounded-full
          bg-sky-100 text-sky-700
          flex items-center justify-center
          font-medium
          ${className}
        `}
      >
        {initials}
      </div>
    )
  }

  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full
        bg-gray-100 text-gray-400
        flex items-center justify-center
        ${className}
      `}
    >
      <User className={iconSizes[size]} />
    </div>
  )
}
