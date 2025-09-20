"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogIn } from "lucide-react"
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
  loginSchema,
  authResponseSchema,
  type AuthResponse,
  type LoginInput,
} from "@/lib/auth"

export default function LoginForm() {
  const router = useRouter()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  })

  const { handleSubmit, control, setError, formState } = form
  const { isSubmitting, errors } = formState

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

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
              setError(field as keyof LoginInput, {
                type: "server",
                message,
              })
              hadField = true
            }
          }

          if (!hadField || rootMessage) {
            setError("root", {
              type: "server",
              message:
                rootMessage ||
                "Invalid email or password",
            })
          }
        } else {
          setError("root", {
            type: "server",
            message: data.message || "Failed to sign in. Please try again.",
          })
        }

        return
      }

      router.push("/home")
    } catch {
      setError("root", {
        type: "server",
        message: "Network error. Please try again.",
      })
    }
  })

  return (
    <>
      {/* Root-level server error */}
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
          {/* Disable all fields while submitting */}
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--auth-label)]">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      className="bg-[var(--auth-input-bg)] border-[var(--auth-input-border)] text-[var(--auth-primary)] focus:ring-[var(--auth-input-focus)] focus:border-[var(--auth-input-focus)]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[var(--auth-error-text)]" />
                  <div className="mt-2 text-right">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[var(--auth-link)] hover:text-[var(--auth-link-hover)]"
                    >
                      Forgot password?
                    </Link>
                  </div>
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
            <LogIn aria-hidden className="size-4" />
            <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
          </Button>
        </form>
      </Form>
    </>
  )
}
