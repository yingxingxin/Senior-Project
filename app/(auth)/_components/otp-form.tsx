/**
 * Simplified OTP Form
 * - Parent components handle their own verification/resend logic
 * - This component just provides the UI and form handling
 */
"use client"

import { Fragment, forwardRef, useImperativeHandle } from "react"
import { MailPlus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot,
} from "@/components/ui/input-otp"
import { Heading, Muted } from "@/components/ui/typography"
import { Stack, Inline } from "@/components/ui/spacing"

const OTP_CODE_LENGTH = 6

type OtpFormProps = {
  email: string
  onSubmit: (code: string) => Promise<void>
  onResend?: () => Promise<void>
  message?: string
  headerIcon?: React.ReactNode
  headerTitle?: string
  headerDescription?: React.ReactNode
}

export function OtpForm({
  email,
  onSubmit,
  onResend,
  message,
  headerIcon = <MailPlus className="size-6" aria-hidden />,
  headerTitle = "Check your email",
  headerDescription,
}: OtpFormProps) {
  const handleResend = async () => {
    if (onResend) {
      await onResend()
    }
  }

  return (
    <Stack gap="default" aria-live="polite">
      {/* Header */}
      <Inline gap="default" align="center" className="text-foreground">
        {headerIcon}
        <div>
          <Heading level={4}>{headerTitle}</Heading>
          <Muted variant="small">
            {headerDescription || <>We sent a verification code to <strong>{email}</strong>.</>}
          </Muted>
        </div>
      </Inline>

      {/* Server message */}
      {message && (
        <div className="rounded border border-success/50 bg-success/10 p-3 text-sm text-success">
          {message}
        </div>
      )}

      {/* OTP input field */}
      <OtpCodeField onSubmit={onSubmit} />

      {/* Resend */}
      {onResend && (
        <div className="text-center">
          <Muted variant="small" as="p">Didn&apos;t get a code?</Muted>
          <Button
            type="button"
            variant="link"
            onClick={handleResend}
          >
            Resend code
          </Button>
        </div>
      )}
    </Stack>
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
  onSubmit: (code: string) => Promise<void>
  disabled?: boolean
  label?: string
  onError?: (error: string) => void
}

export type OtpCodeFieldHandle = {
  reset: () => void
  setError: (message: string) => void
}

export const OtpCodeField = forwardRef<OtpCodeFieldHandle, OtpCodeFieldProps>(
  ({ onSubmit, disabled = false, label = "Enter the 6-digit code", onError }, ref) => {
    const form = useForm<OtpFormValues>({
      resolver: zodResolver(otpSchema),
      defaultValues: { code: "" },
      mode: "onSubmit",
    })
    const { control, handleSubmit, reset, setError, formState: { isSubmitting } } = form

    useImperativeHandle(ref, () => ({
      reset: () => reset({ code: "" }),
      setError: (message: string) => setError("code", { type: "manual", message }),
    }))

    const handleFormSubmit = handleSubmit(async ({ code }) => {
      try {
        await onSubmit(code)
        // Reset form on success
        reset({ code: "" })
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
                <FormLabel className="text-base sm:text-sm font-medium text-foreground">{label}</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={OTP_CODE_LENGTH}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={disabled || isSubmitting}
                    containerClassName="justify-center"
                    onComplete={handleFormSubmit}
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: OTP_CODE_LENGTH }, (_, index) => (
                        <Fragment key={index}>
                          <InputOTPSlot
                            index={index}
                            className="h-14 w-12 sm:h-12 sm:w-10 border-input bg-background text-xl sm:text-lg font-semibold text-foreground"
                          />
                          {index === Math.floor(OTP_CODE_LENGTH / 2) - 1 && (
                            <InputOTPSeparator className="mx-1" />
                          )}
                        </Fragment>
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    )
  }
)

OtpCodeField.displayName = "OtpCodeField"
