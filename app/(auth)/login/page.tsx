import Link from "next/link"
import LoginForm from "@/components/auth/LoginForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Sprite.exe",
  description: "Sign in to your Sprite.exe account",
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-2 text-gray-400">Sign in to your account</p>
      </div>

      {/* Interactive form lives in a Client Component to handle events and local state */}
      <LoginForm />

      <p className="text-center text-sm text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-400 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
