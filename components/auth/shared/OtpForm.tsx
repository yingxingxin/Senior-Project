/**
 * This component is used to display the OTP form.
 * Note we don't use any of the AuthCard or AuthForm components here.
 * This is because I'm unsure if we'll need to use them in the future.
 */
"use client"

import { useRef, useState, useEffect } from "react"
import { AuthButton } from "@/components/auth/shared/AuthButton"
import { MailPlus } from "lucide-react"
import { postJson, formResponseSchema } from "@/lib/auth"
import { Fragment, forwardRef, useImperativeHandle } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { OTP_CODE_LENGTH } from "@/lib/auth"

type OtpFlow = "signup" | "password-reset"

type OtpFormProps = {
  email: string
  flow: OtpFlow
  message?: string
  onSuccess: () => void
  headerIcon?: React.ReactNode
  headerTitle?: string
  headerDescription?: React.ReactNode
}

export function OtpForm({
  email,
  flow,
  message: initialMessage,
  onSuccess,
  headerIcon = <MailPlus className="size-6" aria-hidden />,
  headerTitle = "Check your email",
  headerDescription,
}: OtpFormProps) {
  const [serverMessage, setServerMessage] = useState(initialMessage || "")
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const otpFieldRef = useRef<OtpCodeFieldHandle>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const resetAbort = () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    return abortRef.current.signal
  }

  const verifyOtp = async (code: string) => {
    setIsVerifying(true)
    try {
      const signal = resetAbort()
      const data = await postJson(
        "/api/auth/otp/verify",
        { flow, email, code },
        formResponseSchema,
        signal
      )

      if (!data.ok) {
        throw new Error(data.message || "Verification failed")
      }

      onSuccess()
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") return

      const message = error instanceof Error ? error.message : "Verification failed"
      otpFieldRef.current?.setError(message)
      throw error
    } finally {
      setIsVerifying(false)
    }
  }

  const resendCode = async () => {
    setIsResending(true)
    try {
      const data = await postJson(
        "/api/auth/otp/request",
        { flow, email },
        formResponseSchema
      )

      setServerMessage(
        data.message ||
        (flow === "signup"
          ? "Verification code resent. Check your inbox."
          : "If the email exists, we sent you a code.")
      )
      otpFieldRef.current?.reset()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resend code."
      setServerMessage(message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="space-y-6" aria-live="polite">
      {/* Header */}
      <div className="flex items-center gap-3 text-[var(--auth-primary)]">
        {headerIcon}
        <div>
          <h2 className="text-lg font-semibold">{headerTitle}</h2>
          <p className="text-sm text-[var(--auth-secondary)]">
            {headerDescription || (
              <>We sent a verification code to <strong>{email}</strong>.</>
            )}
          </p>
        </div>
      </div>

      {/* Server message */}
      {serverMessage && (
        <div className="rounded border border-[var(--auth-success-border)] bg-[var(--auth-success-bg)] p-3 text-sm text-[var(--auth-success-text)]">
          {serverMessage}
        </div>
      )}

      {/* OTP input field */}
      <OtpCodeField
        ref={otpFieldRef}
        onSubmit={verifyOtp}
        disabled={isVerifying}
      />

      {/* Resend section */}
      <div className="text-center text-sm text-[var(--auth-secondary)]">
        <p>Didn&apos;t get a code?</p>
        <AuthButton
          type="button"
          variant="link"
          onClick={resendCode}
          isLoading={isResending}
          loadingText="Resending..."
        >
          Resend code
        </AuthButton>
      </div>
    </div>
  )
}

const otpSchema = z.object({
  code: z
    .string()
    .trim()
    .length(OTP_CODE_LENGTH, `Enter the ${OTP_CODE_LENGTH}-digit code`)
    .regex(/^\d+$/u, "Only digits are allowed"),
})

export type OtpFormValues = z.infer<typeof otpSchema>

export type OtpCodeFieldProps = {
  onSubmit: (code: string) => Promise<void> | void
  disabled?: boolean
  label?: string
  onError?: (error: string) => void
}

export type OtpCodeFieldHandle = {
  reset: () => void
  setError: (message: string) => void
}

const OtpCodeField = forwardRef<OtpCodeFieldHandle, OtpCodeFieldProps>(
  ({ onSubmit, disabled = false, label = "Enter the 6-digit code", onError }, ref) => {
    const form = useForm<OtpFormValues>({
      resolver: zodResolver(otpSchema),
      defaultValues: { code: "" },
      mode: "onSubmit",
    })

    const { control, handleSubmit, reset, setError } = form

    useImperativeHandle(ref, () => ({
      reset: () => reset({ code: "" }),
      setError: (message: string) => setError("code", { type: "manual", message }),
    }))

    const handleFormSubmit = handleSubmit(async ({ code }) => {
      try {
        await onSubmit(code)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Verification failed"
        setError("code", { type: "server", message })
        onError?.(message)
      }
    })

    return (
      <Form {...form}>
        <form onSubmit={handleFormSubmit} noValidate>
          <FormField
            control={control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[var(--auth-label)]">{label}</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={OTP_CODE_LENGTH}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={disabled}
                    containerClassName="justify-center"
                    onComplete={handleFormSubmit}
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: OTP_CODE_LENGTH }, (_, index) => (
                        <Fragment key={index}>
                          <InputOTPSlot
                            index={index}
                            className="h-12 w-10 border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] text-lg font-semibold text-[var(--auth-primary)]"
                          />
                          {index === Math.floor(OTP_CODE_LENGTH / 2) - 1 && (
                            <InputOTPSeparator className="mx-1" />
                          )}
                        </Fragment>
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className="text-[var(--auth-error-text)]" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    )
  }
)

OtpCodeField.displayName = "OtpCodeField"
