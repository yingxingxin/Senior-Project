'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePasswordReset } from '@/lib/auth'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Use standardized validation
    const validationErrors = validatePasswordReset(password, confirmPassword)
    if (validationErrors.length > 0) {
      setError(validationErrors[0])
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-auth-background">
        <div className="w-full max-w-md space-y-6 p-8 bg-auth-card rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-auth-primary">Password Reset Successful</h2>
            <p className="mt-2 text-auth-secondary">
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-auth-background">
      <div className="w-full max-w-md space-y-6 p-8 bg-auth-card rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-auth-primary">Reset Your Password</h2>
          <p className="mt-2 text-auth-secondary">
            Enter your new password below
          </p>
        </div>

        {!token ? (
          <div className="text-center space-y-4">
            <p className="text-red-600">Invalid or missing reset token</p>
            <Link
              href="/forgot-password"
              className="text-auth-link hover:text-auth-link-hover transition-colors"
            >
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-auth-label">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-auth-border rounded-md shadow-sm focus:ring-auth-focus focus:border-auth-focus"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-auth-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-auth-border rounded-md shadow-sm focus:ring-auth-focus focus:border-auth-focus"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-auth-button text-white font-semibold rounded-md hover:bg-auth-button-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="text-auth-link hover:text-auth-link-hover transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}