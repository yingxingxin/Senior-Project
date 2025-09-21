import SignupForm from "@/components/auth/SignupForm"
import { AuthCard } from "@/components/auth/shared/AuthCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Sprite.exe",
  description: "Create your Sprite.exe account",
}

export default function SignupPage() {
  return (
    <AuthCard
      title="Create an account"
      subtitle="Get started with Sprite.exe"
      footer={{
        text: "Already have an account?",
        linkText: "Sign in",
        linkHref: "/login"
      }}
    >
      <SignupForm />
    </AuthCard>
  )
}