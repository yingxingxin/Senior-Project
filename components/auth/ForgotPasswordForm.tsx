"use client"

import { useRef } from "react"
import Link from "next/link"
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
  passwordResetRequestSchema,
  formResponseSchema,
  type FormResponse,
} from "@/lib/auth"
import { z } from "zod"

type ForgotPasswordInput = z.infer<typeof passwordResetRequestSchema>

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  })

  const { handleSubmit, control, setError, formState, getValues } = form
  const { isSubmitting, isSubmitSuccessful, errors } = formState

  const successMsgRef = useRef<string>("")

  const onSubmit = handleSubmit(async (values) => {
    let response: Response
    try {
      response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(values),
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
            setError(field as keyof ForgotPasswordInput, {
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
          message:
            rootMessage ||
            "Failed to send reset instructions. Please try again.",
        })
      }

      return
    }

    successMsgRef.current =
      data.message || "If an account exists, reset instructions have been sent"
  })

  if (isSubmitSuccessful) {
    const submittedEmail = getValues("email")

    return (
      <div className="space-y-6" aria-live="polite">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[var(--auth-primary)]">
            Check Your Email
          </h2>
          <p className="text-[var(--auth-secondary)]">
            {successMsgRef.current ||
              "If an account exists, reset instructions have been sent."}
          </p>
          {submittedEmail && (
            <p className="text-[var(--auth-secondary)]">
              We sent a link to {" "}
              <span className="font-medium">{submittedEmail}</span>.
            </p>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-[var(--auth-link)] hover:text-[var(--auth-link-hover)] transition-colors"
          >
            Return to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--auth-primary)]">
          Forgot Password?
        </h2>
        <p className="mt-2 text-[var(--auth-secondary)]">
          Enter your email address and we&apos;ll send you instructions to reset
          your password.
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--auth-label)]">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
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
            {isSubmitting ? "Sending..." : "Send Reset Instructions"}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Link
          href="/"
          className="text-[var(--auth-link)] hover:text-[var(--auth-link-hover)] transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  )
}
