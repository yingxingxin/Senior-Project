"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { OtpForm } from "@/app/(auth)/_components/otp-form"
import { AuthSuccess } from "@/app/(auth)/_components/auth-success"
import { authClient } from "@/lib/auth-client"
import {
  passwordResetRequestSchema,
  passwordResetSchema,
} from "@/app/(auth)/_lib/schemas"
import { Button } from "@/components/ui/button"
import { EmailField, PasswordField, RootError } from "@/app/(auth)/_lib/field-helpers"
import { Heading, Muted } from "@/components/ui/typography"
import { Stack } from "@/components/ui/spacing"

type Step = "email" | "otp" | "password" | "success"

type EmailForm = z.infer<typeof passwordResetRequestSchema>
type PasswordForm = z.infer<typeof passwordResetSchema>

export function ForgotPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  // we store email in state to track the email getting password reset
  const [email, setEmail] = useState("")
  const [verifiedOtp, setVerifiedOtp] = useState("")
  const [otpMessage, setOtpMessage] = useState<string | undefined>()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  // Forms
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" },
  })
  const pwForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  function resetAbort() {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    return abortRef.current.signal
  }

  // Actions
  const onSendCode = emailForm.handleSubmit(async (vals) => {
    try {
      const signal = resetAbort()
      // Send password reset OTP using Better Auth's forgetPassword.emailOtp
      const { error } = await authClient.forgetPassword.emailOtp(
        { email: vals.email },
        { signal }
      )
      if (error) throw new Error(error.message || "Failed to send reset code")
      setEmail(vals.email)
      setStep("otp")
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return
      const message = e instanceof Error ? e.message : "Failed to send code"
      emailForm.setError("root.serverError", { type: "server", message })
    }
  })

  const handleOtpSubmit = async (code: string) => {
    // Verify the OTP
    const { error } = await authClient.emailOtp.checkVerificationOtp({
      email,
      type: "forget-password",
      otp: code,
    })
    if (error) throw new Error(error.message || "Invalid code")
    setVerifiedOtp(code)
    setStep("password")
    pwForm.reset({ password: "", confirmPassword: "" })
  }

  const handleOtpResend = async () => {
    // Resend password reset OTP
    const { error } = await authClient.forgetPassword.emailOtp(
      { email },
      { signal: resetAbort() }
    )
    if (error) throw new Error(error.message || "Failed to resend code")
    setOtpMessage("If the email exists, we sent you a new code.")
  }

  const onSavePassword = pwForm.handleSubmit(async (vals) => {
    try {
      const signal = resetAbort()
      // Reset password with the verified OTP using Better Auth's emailOtp.resetPassword
      const { error } = await authClient.emailOtp.resetPassword(
        {
          email,
          otp: verifiedOtp,
          password: vals.password,
        },
        { signal }
      )
      if (error) throw new Error(error.message || "Failed to reset password")
      setStep("success")
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return
      const message = e instanceof Error ? e.message : "Failed to reset password"
      pwForm.setError("root.serverError", { type: "server", message })
    }
  })

  // Views
  if (step === "success") {
    return (
      <AuthSuccess
        title="Password Reset"
        message="Your password has been reset successfully. You can now log in with your new password."
        primaryAction={{
          label: "Go to Login",
          onClick: () => router.push("/login"),
        }}
        secondaryAction={{
          label: "Return Home",
          onClick: () => router.push("/"),
        }}
      />
    )
  }

  if (step === "otp") {
    return (
      <OtpForm
        email={email}
        onSubmit={handleOtpSubmit}
        onResend={handleOtpResend}
        message={otpMessage}
        headerDescription={<>We sent a verification code to <strong>{email}</strong> if it exists in our system.</>}
      />
    )
  }

  if (step === "password") {
    return (
      <>
        <Stack gap="tight">
          <Heading level={1}>Set New Password</Heading>
          <Muted variant="small" as="p">Choose a strong password for your account</Muted>
        </Stack>

        <FormProvider {...pwForm}>
          <form onSubmit={onSavePassword} noValidate aria-busy={pwForm.formState.isSubmitting}>
            <Stack gap="default">
              <RootError />
              <Stack
                gap="tight"
                as="fieldset"
                {...({ disabled: pwForm.formState.isSubmitting } as React.FieldsetHTMLAttributes<HTMLFieldSetElement>)}
              >
                <PasswordField
                  name="password"
                  label="New password"
                  autoComplete="new-password"
                />
                <PasswordField
                  name="confirmPassword"
                  label="Confirm password"
                  autoComplete="new-password"
                />
              </Stack>

              <Stack gap="tight">
                <Button
                  type="submit"
                  className="w-full h-14 sm:h-12 text-lg sm:text-base font-medium"
                  disabled={pwForm.formState.isSubmitting}
                >
                  {pwForm.formState.isSubmitting ? (
                    <>
                      <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save new password"
                  )}
                </Button>
              </Stack>
            </Stack>
          </form>
        </FormProvider>
      </>
    )
  }

  // email
  return (
    <>
      <Stack gap="tight">
        <Heading level={1}>Forgot Password?</Heading>
        <Muted variant="small" as="p">We&apos;ll send a verification code if your email exists</Muted>
      </Stack>

      <Stack gap="default">
        <FormProvider {...emailForm}>
          <form onSubmit={onSendCode} noValidate aria-busy={emailForm.formState.isSubmitting}>
            <Stack gap="default">
              <RootError />

              <Stack
                gap="tight"
                as="fieldset"
                {...({ disabled: emailForm.formState.isSubmitting } as React.FieldsetHTMLAttributes<HTMLFieldSetElement>)}
              >
                <EmailField
                  name="email"
                  label="Email address"
                  placeholder="you@example.com"
                />
              </Stack>

              <Stack gap="tight">
                <Button
                  type="submit"
                  className="w-full h-14 sm:h-12 text-lg sm:text-base font-medium"
                  disabled={emailForm.formState.isSubmitting}
                >
                  {emailForm.formState.isSubmitting ? (
                    <>
                      <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send code"
                  )}
                </Button>

                <Muted variant="small" className="text-center">
                  Remember your password?{" "}
                  <Link href="/login" className="font-medium text-foreground underline hover:no-underline">
                    Log in
                  </Link>
                </Muted>
              </Stack>
            </Stack>
          </form>
        </FormProvider>
      </Stack>
    </>
  )
}
