"use client"

import * as React from "react"
import { Controller, useFormContext, type FieldPath, type FieldValues } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field"
import { ErrorAlert } from "@/components/ui/error-alert"

type BaseFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>
  label?: React.ReactNode
  placeholder?: string
  autoComplete?: string
  className?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  extra?: React.ReactNode
}

/**
 * EmailField Component
 *
 * Renders an email input field with validation error display using field.tsx components.
 * Integrates with react-hook-form via Controller pattern.
 *
 * Design decisions:
 * - Uses field.tsx generic field layout instead of form.tsx wrapper
 * - Controller manages field state (simpler than FormField context pattern)
 * - Error handling via FieldError component with data-invalid attribute
 * - Supports extra content slot (e.g., for additional help text or links)
 */
function EmailField<TFieldValues extends FieldValues>({
  name,
  label = "Email",
  placeholder = "",
  autoComplete = "email",
  className,
  inputProps,
  extra,
}: BaseFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
          <FieldContent>
            <Input
              {...field}
              id={field.name}
              type="email"
              placeholder={placeholder}
              autoComplete={autoComplete}
              aria-invalid={fieldState.invalid}
              className="h-14 sm:h-12 px-4 text-lg sm:text-base"
              {...inputProps}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
          {extra ? <div className="mt-2">{extra}</div> : null}
        </Field>
      )}
    />
  )
}

/**
 * PasswordField Component
 *
 * Renders a password input field with show/hide toggle and validation error display.
 * Uses field.tsx components for layout and error handling.
 *
 * Design decisions:
 * - Toggle button for show/hide password (improve UX without exposing password unnecessarily)
 * - Uses aria-pressed for accessibility of toggle button
 * - Error handling via FieldError component with data-invalid attribute
 * - Supports extra content slot for password requirements or additional help text
 */
function PasswordField<TFieldValues extends FieldValues>({
  name,
  label = "Password",
  placeholder,
  autoComplete = "current-password",
  className,
  inputProps,
  extra,
}: BaseFieldProps<TFieldValues>) {
  const { control } = useFormContext<TFieldValues>()
  const [show, setShow] = React.useState(false)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
          <FieldContent>
            <div className="relative">
              <Input
                {...field}
                id={field.name}
                type={show ? "text" : "password"}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={fieldState.invalid}
                className="h-14 sm:h-12 px-4 pr-12 text-lg sm:text-base"
                {...inputProps}
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                onClick={() => setShow((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
          {extra ? <div className="mt-2">{extra}</div> : null}
        </Field>
      )}
    />
  )
}

/**
 * RootError Component
 *
 * Displays root-level form errors (e.g., server errors from authentication failure).
 * Uses the ErrorAlert component for consistent, subtle error styling.
 *
 * Design decisions:
 * - Uses ErrorAlert for consistency across the app
 * - Supports custom render function for specialized error formatting
 * - Checks multiple error paths (root.serverError, root) for flexibility
 */
function RootError({
  name = ["root.serverError", "root"],
  className,
  render,
}: {
  name?: string | string[]
  className?: string
  render?: (message: string) => React.ReactNode
}) {
  const { formState } = useFormContext()
  const paths = Array.isArray(name) ? name : [name]

  // Helper function to safely get nested error by dot path
  function getErrorByPath(errors: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce<unknown>(
      (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
      errors
    )
  }

  const message = paths
    .map((path) => getErrorByPath(formState.errors, path))
    .find(
      (error) =>
        error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message !== "undefined"
    ) as { message?: string } | undefined

  const messageValue = message?.message ?? undefined

  if (!messageValue) return null

  // If custom render function provided, use legacy styling for backward compatibility
  if (render) {
    const body = render(String(messageValue))
    return (
      <div
        role="alert"
        aria-live="polite"
        className={className || "rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"}
      >
        • {body}
      </div>
    )
  }

  // Use ErrorAlert component for consistent styling
  return <ErrorAlert message={String(messageValue)} className={className} />
}

export { EmailField, PasswordField, RootError }
