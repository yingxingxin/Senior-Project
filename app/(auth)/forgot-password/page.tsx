'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-auth-background">
        <div className="w-full max-w-md space-y-6 p-8 bg-auth-card rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-auth-primary">Check Your Email</h2>
            <p className="mt-2 text-auth-secondary">
            If an account exists for {email}, we&apos;ve sent password reset instructions to that address.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-auth-link hover:text-auth-link-hover transition-colors"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-auth-background">
      <div className="w-full max-w-md space-y-6 p-8 bg-auth-card rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-auth-primary">Forgot Password?</h2>
          <p className="mt-2 text-auth-secondary">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-auth-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-auth-border rounded-md shadow-sm focus:ring-auth-focus focus:border-auth-focus"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-auth-button text-white font-semibold rounded-md hover:bg-auth-button-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-auth-link hover:text-auth-link-hover transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
