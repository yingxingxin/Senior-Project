"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { AuthForm } from "@/components/auth/shared/AuthForm"
import {
  authResponseSchema,
  signupSchema,
  postJson,
  applyFieldErrors,
  type SignupInput,
} from "@/lib/auth"
import { OtpForm } from "@/components/auth/shared/OtpForm"
import { AuthSuccess } from "@/components/auth/shared/AuthSuccess"

type Step = "form" | "otp" | "verified"

export default function SignupForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [pendingEmail, setPendingEmail] = useState<string>("")
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

  const {
    handleSubmit: handleSignupSubmit,
    control: signupControl,
    formState: { isSubmitting: isSignupSubmitting, errors: signupErrors },
    setError: setSignupError,
    getValues,
    reset: resetSignup,
  } = signupForm

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const submitSignup = handleSignupSubmit(async (values) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      await postJson(
        "/api/auth/signup",
        values,
        authResponseSchema,
        controller.signal
      )

      // Success - move to OTP step
      setPendingEmail(values.email)
      setStep("otp")
      resetSignup(
        { ...getValues(), password: "", confirmPassword: "" },
        { keepValues: true }
      )
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") return
      applyFieldErrors(error, setSignupError, Object.keys(values) as (keyof SignupInput)[])
    }
  })

  const handleOtpSuccess = () => {
    setStep("verified")
  }

  if (step === "verified") {
    return (
      <AuthSuccess
        title="Email Verified!"
        message="Your email has been verified successfully. Let's set up your assistant."
        primaryAction={{
          label: "Continue to Setup",
          onClick: () => router.push("/onboarding")
        }}
        secondaryAction={{
          label: "Skip for Now",
          onClick: () => router.push("/explore")
        }}
      />
    )
  }

  if (step === "otp") {
    return (
      <OtpForm
        email={pendingEmail}
        flow="signup"
        onSuccess={handleOtpSuccess}
      />
    )
  }

  return (
    <>
      <AuthForm.RootError message={signupErrors.root?.message} />

      <AuthForm {...signupForm}>
        <form onSubmit={submitSignup} noValidate aria-busy={isSignupSubmitting}>
          <AuthForm.Body>
            <AuthForm.Fieldset disabled={isSignupSubmitting}>
              <AuthForm.EmailField control={signupControl} name="email" label="Email" />

              <AuthForm.EmailField control={signupControl} name="confirmEmail" label="Confirm Email" />

              <AuthForm.PasswordField
                control={signupControl}
                name="password"
                label="Password"
                autoComplete="new-password"
              />

              <AuthForm.PasswordField
                control={signupControl}
                name="confirmPassword"
                label="Confirm Password"
                autoComplete="new-password"
              />
            </AuthForm.Fieldset>

            <AuthForm.Actions>
              <AuthForm.Button
                type="submit"
                startIcon={<UserPlus aria-hidden className="size-4" />}
                isLoading={isSignupSubmitting}
                loadingText="Creating account..."
              >
                Create Account
              </AuthForm.Button>
            </AuthForm.Actions>
          </AuthForm.Body>
        </form>
      </AuthForm>
    </>
  )
}
