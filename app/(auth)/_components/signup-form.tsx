"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, UserPlus } from "lucide-react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { OtpForm } from "@/app/(auth)/_components/otp-form"
import { AuthSuccess } from "@/app/(auth)/_components/auth-success"
import { SocialButtons } from "@/app/(auth)/_components/social-buttons"
import { Stack } from "@/components/ui/spacing"
import { Button } from "@/components/ui/button"
import { EmailField, PasswordField, RootError } from "@/app/(auth)/_lib/field-helpers"

import {
  signupSchema,
  type SignupInput,
} from "@/app/(auth)/_lib/schemas"
import { authClient } from "@/lib/auth-client"

type Step = "form" | "otp" | "verified"

export function SignupForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [pendingEmail, setPendingEmail] = useState<string>("")
  const [otpMessage, setOtpMessage] = useState<string | undefined>()
  const abortRef = useRef<AbortController | null>(null)

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  })

  useEffect(() => () => abortRef.current?.abort(), [])

  const submitSignup = signupForm.handleSubmit(async (values) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      // 1) Create the account
      const { error: signUpErr } = await authClient.signUp.email(
        {
          // Better Auth docs show `name` required; use local-part if you don't collect a name.
          name: values.email.split("@")[0],
          email: values.email,
          password: values.password,
        },
        { signal: controller.signal }
      )
      if (signUpErr) throw new Error(signUpErr.message || "Sign up failed")

      // 2) Send email verification OTP (plugin overrides link-based verification)
      const { error: sendErr } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "email-verification",
      })
      if (sendErr) throw new Error(sendErr.message || "Failed to send verification code")

      setPendingEmail(values.email)
      setStep("otp")

      // Clear only password fields for safety
      signupForm.reset(
        { ...signupForm.getValues(), password: "", confirmPassword: "" },
        { keepValues: true }
      )
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Request failed"
      signupForm.setError("root.serverError", { type: "server", message: msg })
    }
  })

  const handleOtpSubmit = async (otpValue: string) => {
    // Verify email with OTP
    const { error } = await authClient.emailOtp.verifyEmail({
      email: pendingEmail,
      otp: otpValue,
    })
    if (error) {
      throw new Error(error.message || "Verification failed")
    }
    setStep("verified")
  }

  const handleOtpResend = async () => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: pendingEmail,
      type: "email-verification",
    })
    if (error) {
      throw new Error(error.message || "Failed to resend code")
    }
    setOtpMessage("Verification code resent. Check your inbox.")
  }

  if (step === "verified") {
    return (
      <AuthSuccess
        title="Email Verified!"
        message="Your email has been verified successfully. Let's set up your assistant."
        primaryAction={{ label: "Continue to Setup", onClick: () => router.push("/onboarding") }}
        secondaryAction={{ label: "Skip for Now", onClick: () => router.push("/home") }}
      />
    )
  }

  if (step === "otp") {
    return (
      <OtpForm
        email={pendingEmail}
        onSubmit={handleOtpSubmit}
        onResend={handleOtpResend}
        message={otpMessage}
      />
    )
  }

  // form
  const { formState: { isSubmitting } } = signupForm

  return (
    <FormProvider {...signupForm}>
      <form onSubmit={submitSignup} noValidate aria-busy={isSubmitting}>
        <Stack gap="default">
          <RootError />

          <Stack
            gap="tight"
            as="fieldset"
            {...({ disabled: isSubmitting } as React.FieldsetHTMLAttributes<HTMLFieldSetElement>)}
          >
            <EmailField name="email" label="Email" />
            <EmailField name="confirmEmail" label="Confirm Email" />
            <PasswordField name="password" label="Password" autoComplete="new-password" />
            <PasswordField name="confirmPassword" label="Confirm Password" autoComplete="new-password" />
          </Stack>
          <Stack gap="tight">
            <Button
              type="submit"
              className="w-full h-14 sm:h-12 text-lg sm:text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus aria-hidden className="size-4" />
                  Create Account
                </>
              )}
            </Button>
          </Stack>

          {/* Social sign-in */}
          <SocialButtons disabled={isSubmitting} />
        </Stack>
      </form>
    </FormProvider>
  )
}
