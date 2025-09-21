import LoginForm from "@/components/auth/LoginForm"
import { AuthCard } from "@/components/auth/shared/AuthCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Sprite.exe",
  description: "Sign in to your Sprite.exe account",
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={{
        text: "Don't have an account?",
        linkText: "Sign up",
        linkHref: "/signup"
      }}
    >
      <LoginForm />
    </AuthCard>
  )
}
