import SignupForm from "@/components/auth/SignupForm"
import { AuthCard } from "@/components/auth/shared/AuthCard"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Sprite.exe",
  description: "Create your Sprite.exe account",
}

export default function SignupPage() {
  return (
    <AuthCard
      title="Create an account"
      subtitle={
        <span className="text-base sm:text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline hover:no-underline">
            Log in
          </Link>
        </span>
      }
    >
      <SignupForm />
    </AuthCard>
  )
}
