"use client"

import * as React from "react"
import type { Control, FieldValues, Path } from "react-hook-form"

import { AuthButton, type AuthButtonProps } from "@/components/auth/shared/AuthButton"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

function withAuthLabel(children?: React.ReactNode) {
  return children ? <FormLabel className="text-[var(--auth-label)]">{children}</FormLabel> : null
}

type AuthFormFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: React.ReactNode
}

type AuthFormEmailFieldProps<TFieldValues extends FieldValues> = AuthFormFieldProps<TFieldValues> & {
  placeholder?: string
  autoComplete?: string
}

const AuthFormEmailField = <TFieldValues extends FieldValues>({
  control,
  name,
  label = "Email",
  placeholder = "",
  autoComplete = "email",
}: AuthFormEmailFieldProps<TFieldValues>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        {withAuthLabel(label)}
        <FormControl>
          <Input
            type="email"
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="bg-[var(--auth-input-bg)] border-[var(--auth-input-border)] text-[var(--auth-primary)] focus:ring-[var(--auth-input-focus)] focus:border-[var(--auth-input-focus)]"
            {...field}
          />
        </FormControl>
        <FormMessage className="text-[var(--auth-error-text)]" />
      </FormItem>
    )}
  />
)

const AuthFormPasswordField = <TFieldValues extends FieldValues>({
  control,
  name,
  label = "Password",
  autoComplete = "current-password",
  extra,
}: AuthFormFieldProps<TFieldValues> & {
  autoComplete?: string
  extra?: React.ReactNode
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        {withAuthLabel(label)}
        <FormControl>
          <Input
            type="password"
            autoComplete={autoComplete}
            className="bg-[var(--auth-input-bg)] border-[var(--auth-input-border)] text-[var(--auth-primary)] focus:ring-[var(--auth-input-focus)] focus:border-[var(--auth-input-focus)]"
            {...field}
          />
        </FormControl>
        <FormMessage className="text-[var(--auth-error-text)]" />
        {extra ? <div className="mt-2">{extra}</div> : null}
      </FormItem>
    )}
  />
)

const AuthFormRootError = ({ message }: { message?: string }) => {
  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded border border-[var(--auth-error-border)] bg-[var(--auth-error-bg)] p-3 text-sm text-[var(--auth-error-text)]"
    >
      • {message}
    </div>
  )
}

const AuthFormFieldset = ({ className, ...props }: React.FieldsetHTMLAttributes<HTMLFieldSetElement>) => (
  <fieldset className={cn("space-y-4", className)} {...props} />
)

const AuthFormActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-3", className)} {...props} />
)

const AuthFormBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-4", className)} {...props} />
)

const AuthFormButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>((props, ref) => (
  <AuthButton ref={ref} fullWidth {...props} />
))
AuthFormButton.displayName = "AuthFormButton"

const AuthFormRoot = Form

const AuthForm = Object.assign(AuthFormRoot, {
  Body: AuthFormBody,
  Button: AuthFormButton,
  Fieldset: AuthFormFieldset,
  Actions: AuthFormActions,
  RootError: AuthFormRootError,
  EmailField: AuthFormEmailField,
  PasswordField: AuthFormPasswordField,
})

export { AuthForm }
