"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { getFieldState, formState } = useFormContext()
  const fieldState = getFieldState(fieldContext.name, formState)
  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(
        "text-base sm:text-sm font-medium",
        error && "text-destructive",
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

type BaseFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>
  label?: React.ReactNode
  placeholder?: string
  autoComplete?: string
  className?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  extra?: React.ReactNode
}

function EmailField<TFieldValues extends FieldValues>({
  name,
  label = "Email",
  placeholder = "",
  autoComplete = "email",
  className,
  inputProps,
  extra,
}: BaseFieldProps<TFieldValues>) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type="email"
              placeholder={placeholder}
              autoComplete={autoComplete}
              className="h-14 sm:h-12 px-4 text-lg sm:text-base"
              {...inputProps}
              {...field}
            />
          </FormControl>
          <FormMessage />
          {extra ? <div className="mt-2">{extra}</div> : null}
        </FormItem>
      )}
    />
  )
}

function PasswordField<TFieldValues extends FieldValues>({
  name,
  label = "Password",
  placeholder,
  autoComplete = "current-password",
  className,
  inputProps,
  extra,
}: BaseFieldProps<TFieldValues>) {
  const [show, setShow] = React.useState(false)

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="h-14 sm:h-12 px-4 pr-12 text-lg sm:text-base"
                {...inputProps}
                {...field}
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
          </FormControl>
          <FormMessage />
          {extra ? <div className="mt-2">{extra}</div> : null}
        </FormItem>
      )}
    />
  )
}

// tiny helper to safely get nested error by dot path
function getErrorByPath(errors: FieldErrors, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), errors)
}

type RootErrorProps = {
  name?: string | string[]
  className?: string
  render?: (message: string) => React.ReactNode
}

function RootError({ name = ["root.serverError", "root"], className, render }: RootErrorProps) {
  const { control } = useFormContext()
  const paths = Array.isArray(name) ? name : [name]
  const { errors } = useFormState({ control, name: paths })

  const message =
    paths
      .map((path) => getErrorByPath(errors, path))
      .find((error) => error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message !== "undefined") as { message?: string } | undefined

  const messageValue = message?.message ?? undefined

  if (!messageValue) return null

  const body = render ? render(String(messageValue)) : String(messageValue)

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive",
        className
      )}
    >
      • {body}
    </div>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  EmailField,
  PasswordField,
  RootError,
}
