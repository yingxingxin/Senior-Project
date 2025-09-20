"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  passwordResetSchema,
  formResponseSchema,
  type FormResponse,
  type PasswordResetInput,
} from "@/lib/auth"

type PasswordResetFormProps = {
  token?: string
}

export function PasswordResetForm({ token }: PasswordResetFormProps) {
  const router = useRouter()
  const successMsgRef = useRef<string>("")

  const form = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  })

  const { handleSubmit, control, setError, reset, formState } = form
  const { isSubmitting, isSubmitSuccessful, errors } = formState

  useEffect(() => {
    if (!isSubmitSuccessful) return
    const timer = setTimeout(() => {
      router.push("/login")
    }, 3000)

    return () => clearTimeout(timer)
  }, [isSubmitSuccessful, router])

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setError("root", {
        type: "server",
        message: "Invalid or missing reset token",
      })
      return
    }

    let response: Response
    try {
      response = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ token, ...values }),
      })
    } catch {
      setError("root", {
        type: "server",
        message: "Network error. Please try again.",
      })
      return
    }

    const raw = await response.text()
    let data: FormResponse

    try {
      data = formResponseSchema.parse(raw ? JSON.parse(raw) : {})
    } catch {
      setError("root", {
        type: "server",
        message: "Unexpected server response. Please try again.",
      })
      return
    }

    if (!response.ok || !data.ok) {
      let rootMessage = data.message ?? ""
      let hadField = false

      if (!data.ok) {
        for (const { field, message } of data.errors) {
          if (field === "root") {
            rootMessage = message
          } else if (field in values) {
            setError(field as keyof PasswordResetInput, {
              type: "server",
              message,
            })
            hadField = true
          } else {
            rootMessage = message
          }
        }
      }

      if (!hadField || rootMessage) {
        setError("root", {
          type: "server",
          message: rootMessage || "Failed to reset password. Please try again.",
        })
      }

      return
    }

    successMsgRef.current = data.message || "Password reset successful"
    reset(undefined, { keepValues: false, keepDirty: false })
  })

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[var(--auth-primary)]">
            Invalid reset link
          </h2>
          <p className="text-[var(--auth-secondary)]">
            The reset token is missing or invalid. You can request a new link
            below.
          </p>
        </div>

        <div className="text-center space-y-2">
          <Link
            href="/forgot-password"
            className="text-[var(--auth-link)] hover:text-[var(--auth-link-hover)] transition-colors"
          >
            Request a new reset email
          </Link>
          <p className="text-sm text-[var(--auth-secondary)]">
            Already remember your password?{' '}
            <Link
              href="/login"
              className="text-[var(--auth-link)] hover:text-[var(--auth-link-hover)] transition-colors"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (isSubmitSuccessful) {
    return (
      <div className="space-y-6" aria-live="polite">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[var(--auth-primary)]">
            Password Reset Successful
          </h2>
          <p className="text-[var(--auth-secondary)]">
            {successMsgRef.current}
          </p>
          <p className="text-sm text-[var(--auth-secondary)]">
            Redirecting you to the login page…
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-[var(--auth-link)] hover:text-[var(--auth-link-hover)] transition-colors"
          >
            Back to login now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--auth-primary)]">
          Reset Your Password
        </h2>
        <p className="mt-2 text-[var(--auth-secondary)]">
          Enter your new password below.
        </p>
      </div>

      {errors.root?.message && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 text-sm bg-[var(--auth-error-bg)] border border-[var(--auth-error-border)] rounded text-[var(--auth-error-text)]"
        >
          {errors.root.message}
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-4"
          aria-busy={isSubmitting}
        >
          <fieldset disabled={isSubmitting} className="space-y-4">
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--auth-label)]">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="bg-[var(--auth-input-bg)] border-[var(--auth-input-border)] text-[var(--auth-primary)] focus:ring-[var(--auth-input-focus)] focus:border-[var(--auth-input-focus)]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[var(--auth-error-text)]" />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--auth-label)]">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="bg-[var(--auth-input-bg)] border-[var(--auth-input-border)] text-[var(--auth-primary)] focus:ring-[var(--auth-input-focus)] focus:border-[var(--auth-input-focus)]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[var(--auth-error-text)]" />
                </FormItem>
              )}
            />
          </fieldset>

          <Button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
            className="w-full bg-[var(--auth-button)] hover:bg-[var(--auth-button-hover)]"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Link
          href="/login"
          className="text-[var(--auth-link)] hover:text-[var(--auth-link-hover)] transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
