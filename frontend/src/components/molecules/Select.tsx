import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  options: SelectOption[]
  onChange?: (value: string) => void
  error?: string
  placeholder?: string
}

export function Select({
  label,
  options,
  onChange,
  error,
  placeholder = '請選擇',
  className = '',
  value,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`
            w-full h-12 px-4 pr-10
            text-base
            bg-white
            border rounded-md
            appearance-none
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${!value ? 'text-gray-400' : 'text-gray-900'}
            ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
