"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, CheckCircle } from "lucide-react"
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
import { AuthResponse, authResponseSchema, signupSchema, type SignupInput } from "@/lib/auth"

export default function SignupForm() {
  const router = useRouter()

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  })

  const { handleSubmit, control, setError, formState, getValues, reset } = form
  const { isSubmitting, isSubmitSuccessful, errors } = formState

  // Keep server success message without extra state
  const successMsgRef = useRef<string>("")

  const onSubmit = handleSubmit(async (values: SignupInput) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(values),
      })
  
      // robust parse: handle empty body, bad JSON, and validate shape
      const raw = await res.text()
      let data: AuthResponse
      try {
        data = authResponseSchema.parse(raw ? JSON.parse(raw) : {})
      } catch {
        setError("root", {
          type: "server",
          message: "Unexpected server response. Please try again.",
        })
        return
      }
  
      if (!res.ok || !data.ok) {
        if (!data.ok) {
          let rootMessage = data.message ?? ""
          let hadField = false

          for (const { field, message } of data.errors) {
            if (field === "root") {
              rootMessage = message
            } else if (field in values) {
              setError(field as keyof SignupInput, {
                type: "server",
                message,
              })
              hadField = true
            } else {
              rootMessage = message
            }
          }

          if (!hadField || rootMessage) {
            setError("root", {
              type: "server",
              message:
                rootMessage ||
                "Failed to create account. Please try again.",
            })
          }
        } else {
          setError("root", {
            type: "server",
            message: data.message || "Failed to create account. Please try again.",
          })
        }

        return
      }
  
      successMsgRef.current =
        data.message ||
        "Verification email sent. Please check your inbox."
  
      // optional: clear sensitive fields, keep email for the success UI
      reset(
        { ...getValues(), password: "", confirmPassword: "" },
        { keepValues: true }
      )
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        setError("root", {
          type: "server",
          message: "Network error. Please try again.",
        })
      }
    }
    })

  if (isSubmitSuccessful) {
    return (
      <div className="space-y-6" aria-live="polite">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="size-16 text-[var(--auth-success-text)]" aria-hidden />
          <h2 className="text-2xl font-semibold text-[var(--auth-success-text)]">
            Check Your Email!
          </h2>
        </div>

        <div className="p-4 bg-[var(--auth-success-bg)] border border-[var(--auth-success-border)] rounded text-[var(--auth-success-text)] text-sm space-y-2">
          <p className="font-medium">{successMsgRef.current}</p>
          <p className="opacity-80">
            We sent a verification link to{" "}
            <span className="font-medium">{getValues("email")}</span>
          </p>
        </div>

        <div className="space-y-3 text-sm text-[var(--auth-secondary)]">
          <p>Didn&apos;t receive the email? Check your spam folder.</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-[var(--auth-button)] hover:bg-[var(--auth-button-hover)]"
          >
            Go to Login
          </Button>
          <Button onClick={() => router.push("/")} className="w-full" variant="outline">
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {errors.root?.message && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 bg-[var(--auth-error-bg)] border border-[var(--auth-error-border)] rounded text-[var(--auth-error-text)] text-sm"
        >
          • {errors.root.message}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit} noValidate className="space-y-4" aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--auth-label)]">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
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
              name="confirmEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--auth-label)]">Confirm Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--auth-label)]">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
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
                  <FormLabel className="text-[var(--auth-label)]">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
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
            className="w-full bg-[var(--auth-button)] hover:bg-[var(--auth-button-hover)]"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            <UserPlus aria-hidden className="size-4" />
            <span>{isSubmitting ? "Creating account..." : "Sign Up"}</span>
          </Button>
        </form>
      </Form>
    </>
  )
}
