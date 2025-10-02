import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"
import { AuthCard } from "@/components/auth/shared/AuthCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password - Sprite.exe",
  description: "Reset your Sprite.exe account password",
}

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <ForgotPasswordForm />
    </AuthCard>
  )
}
