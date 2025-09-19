"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validateSignup, type SignupInput } from "@/lib/auth"

// Client component - only handles form interactivity and state
// Structure and static content are in the page component
export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignupInput>({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleInputChange = (field: keyof SignupInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const validationErrors = validateSignup(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data?.ok) {
        // Show success message instead of immediately redirecting
        setSuccessMessage(data.message || "Account created successfully! Please check your email to verify your account.")
        setIsSuccess(true)
      } else {
        const fallback = "Failed to create account. Please try again."
        setErrors(Array.isArray(data?.errors) ? data.errors : [fallback])
      }
    } catch {
      setErrors(["Failed to create account. Please try again."])
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayErrors = errors

  // Show success message after signup
  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="size-16 text-green-400" aria-hidden />
          <h2 className="text-2xl font-semibold text-green-400">Check Your Email!</h2>
        </div>

        <div className="p-4 bg-green-900/20 border border-green-500/50 rounded text-green-300 text-sm space-y-2">
          <p className="font-medium">{successMessage}</p>
          <p className="text-green-300/80">
            We sent a verification link to <span className="font-medium">{formData.email}</span>
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-400">
          <p>Didn&apos;t receive the email? Check your spam folder.</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/login")}
            className="w-full"
          >
            Go to Login
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="w-full"
            variant="outline"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

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
          <label htmlFor="confirmEmail" className="block text-sm font-medium mb-1 text-gray-300">
            Confirm Email
          </label>
          <Input
            id="confirmEmail"
            type="email"
            value={formData.confirmEmail}
            onChange={(e) => handleInputChange("confirmEmail", e.target.value)}
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
            autoComplete="new-password"
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-300">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            autoComplete="new-password"
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          <UserPlus aria-hidden className="size-4" />
          <span>{isSubmitting ? "Creating account..." : "Sign Up"}</span>
        </Button>
      </form>
    </>
  )
}
