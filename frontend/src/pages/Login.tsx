import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import { Input } from '../components/atoms/Input'
import { Button } from '../components/atoms/Button'
import { useAppStore } from '../stores/useAppStore'

export function Login() {
  const navigate = useNavigate()
  const { login, addToast } = useAppStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('請輸入帳號和密碼')
      return
    }

    setLoading(true)

    // Simulate login - in real app, call API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Demo: accept any login
    login({
      id: 1,
      username,
      role: 'admin',
      displayName: username === 'admin' ? '管理員' : '老師'
    })

    addToast({ type: 'success', message: '登入成功' })
    navigate('/dashboard')

    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">KG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">KindyGuard</h1>
          <p className="text-gray-500 mt-1">幼兒園智慧門禁系統</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="帳號"
            placeholder="請輸入帳號"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<User className="w-5 h-5" />}
            autoComplete="username"
          />

          <Input
            label="密碼"
            type="password"
            placeholder="請輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm text-gray-600">記住我</span>
          </label>

          <Button type="submit" loading={loading} className="w-full">
            登入
          </Button>
        </form>

        {/* Demo hint */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Demo: 輸入任意帳號密碼即可登入
        </p>
      </div>
    </div>
  )
}
