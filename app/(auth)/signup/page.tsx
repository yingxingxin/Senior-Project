import Link from "next/link"
import SignupForm from "@/components/auth/SignupForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Sprite.exe",
  description: "Create your Sprite.exe account",
}

export default function SignupPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-gray-400 mt-2">Get started with Sprite.exe</p>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}