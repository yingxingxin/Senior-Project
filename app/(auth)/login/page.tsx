import LoginForm from "@/components/auth/LoginForm"
import { AuthCard } from "@/components/auth/shared/AuthCard"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Sprite.exe",
  description: "Sign in to your Sprite.exe account",
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle={
        <span className="text-base sm:text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline hover:no-underline">
            Sign up
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthCard>
  )
}
