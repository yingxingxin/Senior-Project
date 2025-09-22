"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogIn } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { AuthForm } from "@/components/auth/shared/AuthForm"
import {
  loginSchema,
  authResponseSchema,
  postJson,
  applyFieldErrors,
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
      await postJson("/api/auth/login", values, authResponseSchema)
      router.push("/explore")
    } catch (error) {
      applyFieldErrors(error, setError, ["email", "password"])
    }
  })

  return (
    <>
      <AuthForm.RootError message={errors.root?.message} />

      <AuthForm {...form}>
        <form onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
          {/* Disable all fields while submitting */}
          <AuthForm.Body>
            <AuthForm.Fieldset disabled={isSubmitting}>
              <AuthForm.EmailField control={control} name="email" label="Email" />

              <AuthForm.PasswordField
                control={control}
                name="password"
                label="Password"
                autoComplete="current-password"
                extra={
                  <div className="text-right">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                }
              />
            </AuthForm.Fieldset>

            <AuthForm.Actions>
              <AuthForm.Button
                type="submit"
                startIcon={<LogIn aria-hidden className="size-4" />}
                isLoading={isSubmitting}
                loadingText="Signing in..."
              >
                Sign In
              </AuthForm.Button>
            </AuthForm.Actions>
          </AuthForm.Body>
        </form>
      </AuthForm>
    </>
  )
}
