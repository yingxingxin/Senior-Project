import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password - Sprite.exe",
  description: "Forgot your password?",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--auth-background)]">
      <div className="w-full max-w-md space-y-6 p-8 bg-[var(--auth-card)] rounded-lg shadow-lg">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
