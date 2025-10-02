"use client"

import * as React from "react"
import type { Control, FieldValues, Path } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

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
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>
          <Input
            type="email"
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="h-14 sm:h-12 px-4 text-lg sm:text-base"
            {...field}
          />
        </FormControl>
        <FormMessage />
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
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>
          <Input
            type="password"
            autoComplete={autoComplete}
            className="h-14 sm:h-12 px-4 text-lg sm:text-base"
            {...field}
          />
        </FormControl>
        <FormMessage />
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
      className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
    >
      • {message}
    </div>
  )
}

interface AuthFormButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: React.ReactNode
}

const AuthFormButton = React.forwardRef<HTMLButtonElement, AuthFormButtonProps>(
  ({ isLoading, loadingText, children, disabled, className, ...props }, ref) => (
    <Button ref={ref} className={cn("w-full h-14 sm:h-12 text-lg sm:text-base font-medium", className)} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? (loadingText || children) : children}
    </Button>
  )
)
AuthFormButton.displayName = "AuthFormButton"

const AuthFormRoot = Form

const AuthForm = Object.assign(AuthFormRoot, {
  Button: AuthFormButton,
  RootError: AuthFormRootError,
  EmailField: AuthFormEmailField,
  PasswordField: AuthFormPasswordField,
})

export { AuthForm }
