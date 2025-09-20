"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogIn } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginInput } from "@/lib/auth"

// Client component - only handles form interactivity and state
// Structure and static content are in the page component
export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof LoginInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const validation = loginSchema.safeParse(formData)
    if (!validation.success) {
      const { formErrors, fieldErrors } = z.flattenError(validation.error)
      const flattenedErrors = [
        ...formErrors,
        ...Object.values(fieldErrors).flat(),
      ]
      setErrors(flattenedErrors)
      setIsSubmitting(false)
      return
    }

    const payload = validation.data

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data?.ok) {
        router.push("/home")
      } else {
        const fallback = "Invalid email or password"
        setErrors(Array.isArray(data?.errors) ? data.errors : [fallback])
      }
    } catch {
      setErrors(["Failed to sign in. Please try again."])
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayErrors = errors

  return (
    <>
      {/* Error display */}
      {displayErrors.length > 0 && (
        <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-red-400 text-sm">
          {displayErrors.map((error, index) => (
            <div key={index}>• {error}</div>
          ))}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-300">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            autoComplete="email"
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-300">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            autoComplete="current-password"
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          <LogIn aria-hidden className="size-4" />
          <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
        </Button>
      </form>
    </>
  )
}
