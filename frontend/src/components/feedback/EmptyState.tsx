import type { ReactNode } from 'react'
import { FileQuestion, Search, Users } from 'lucide-react'
import { Button } from '../atoms/Button'

type EmptyStateVariant = 'no-data' | 'no-results' | 'no-children'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: ReactNode
}

const defaultContent: Record<EmptyStateVariant, { icon: ReactNode; title: string; description: string }> = {
  'no-data': {
    icon: <FileQuestion className="w-12 h-12 text-gray-300" />,
    title: '尚無資料',
    description: '系統開始運作後，資料將顯示於此',
  },
  'no-results': {
    icon: <Search className="w-12 h-12 text-gray-300" />,
    title: '找不到符合條件的結果',
    description: '請調整搜尋條件後再試一次',
  },
  'no-children': {
    icon: <Users className="w-12 h-12 text-gray-300" />,
    title: '尚無兒童資料',
    description: '點擊「新增」按鈕開始建立兒童資料',
  },
}

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  action,
  icon
}: EmptyStateProps) {
  const content = defaultContent[variant]

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {icon || content.icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || content.title}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        {description || content.description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
