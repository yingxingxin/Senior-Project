"use client"

import Link from "next/link"
import { Loader2, MailCheck, ShieldAlert, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type VerificationState = "verifying" | "success" | "error" | "no-token" | "already-verified"

interface VerifyEmailContentProps {
  state: VerificationState
  errorMessage?: string
}

// Client component handles redirects and interactive elements
// Verification logic happens server-side in the page component
export default function VerifyEmailContent({
  state,
  errorMessage
}: VerifyEmailContentProps) {
  // No automatic redirects - let users choose where to go

  // Server-side verification shows immediate state, no loading needed
  const renderContent = () => {
    switch (state) {
      case "verifying":
        // This state should rarely be seen as verification happens server-side
        return (
          <>
            <CardHeader className="space-y-4">
              <Loader2 className="mx-auto size-12 animate-spin text-blue-400" aria-hidden />
              <CardTitle className="text-2xl font-semibold">
                Verifying your email
              </CardTitle>
              <CardDescription className="text-white/60">
                Hang tight while we confirm your email address. This only takes a moment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-white/70">
                Once confirmed, we&apos;ll redirect you to the login page where you can sign in
                to your account.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-white/50">
                <MailCheck className="size-4" aria-hidden />
                <span>Processing verification token...</span>
              </div>
            </CardContent>
          </>
        )

      case "already-verified":
        return (
          <>
            <CardHeader className="space-y-4">
              <CheckCircle className="mx-auto size-12 text-blue-400" aria-hidden />
              <CardTitle className="text-2xl font-semibold">
                Email Already Verified
              </CardTitle>
              <CardDescription className="text-white/60">
                Your email has already been confirmed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-white/70">
                Your account is active and ready to use.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/login">Go to Login</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/">Go to Home</Link>
                </Button>
              </div>
            </CardContent>
          </>
        )

      case "success":
        return (
          <>
            <CardHeader className="space-y-4">
              <CheckCircle className="mx-auto size-12 text-green-400" aria-hidden />
              <CardTitle className="text-2xl font-semibold text-green-400">
                Email Verified Successfully!
              </CardTitle>
              <CardDescription className="text-white/60">
                Your email has been confirmed and your account is now active.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-white/70">
                Great! Your email has been verified. You can now login to your account or explore the app.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/login">Go to Login</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/">Go to Home</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/onboarding">Start Onboarding</Link>
                </Button>
              </div>
            </CardContent>
          </>
        )

      case "error":
        return (
          <>
            <CardHeader className="space-y-4">
              <XCircle className="mx-auto size-12 text-red-400" aria-hidden />
              <CardTitle className="text-2xl font-semibold text-red-400">
                Verification Failed
              </CardTitle>
              <CardDescription className="text-white/60">
                {errorMessage || "We couldn't verify your email address."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-white/70">
                The verification link may have expired or already been used. Please try signing up
                again or contact support if the problem persists.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/signup">Sign Up Again</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            </CardContent>
          </>
        )

      case "no-token":
        return (
          <>
            <CardHeader className="space-y-4">
              <ShieldAlert className="mx-auto size-12 text-amber-400" aria-hidden />
              <CardTitle className="text-2xl font-semibold">
                Verification Link Invalid
              </CardTitle>
              <CardDescription className="text-white/60">
                The verification link is missing or invalid.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-white/70">
                You need a valid verification token to confirm your email. Please check your email
                for the verification link or sign up again to receive a new one.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/signup">Sign Up</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            </CardContent>
          </>
        )
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
      <Card className="w-full border-white/10 bg-white/5">
        {renderContent()}
      </Card>

      <div className="space-y-2 text-sm text-white/60">
        <p>Need help? Reach us at support@sprite.exe</p>
        {state !== "success" && state !== "already-verified" && (
          <p>
            <Link href="/login" className="text-blue-300 underline-offset-4 hover:underline">
              Return to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}