import { z } from "zod";

import { MIN_PASSWORD_LENGTH } from "./constants";

const emailMessage = "Email is required";
const passwordMessage = "Password is required";
const confirmEmailMessage = "Please confirm your email";
const confirmPasswordMessage = "Please confirm your password";
const otpFlowMessage = "OTP flow is required";
const emailFormatMessage = "Please enter a valid email address";

const emailFormatSchema = z.email({ message: emailFormatMessage });

export const emailField = z
  .string()
  .trim()
  .min(1, { message: emailMessage })
  .toLowerCase()
  .pipe(emailFormatSchema);

export const passwordField = z
  .string()
  .min(1, { message: passwordMessage })
  .refine((value) => value.length >= MIN_PASSWORD_LENGTH, {
    message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  });

const confirmEmailField = z
  .string()
  .trim()
  .min(1, { message: confirmEmailMessage })
  .toLowerCase()
  .pipe(emailFormatSchema);

const confirmPasswordField = z
  .string()
  .min(1, { message: confirmPasswordMessage });

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const signupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmEmail: confirmEmailField,
    confirmPassword: confirmPasswordField,
  })
  .superRefine((data, ctx) => {
    if (data.email !== data.confirmEmail) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmEmail"],
        message: "Emails do not match",
      });
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const passwordResetSchema = z
  .object({
    password: passwordField,
    confirmPassword: confirmPasswordField,
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const passwordResetRequestSchema = z.object({
  email: emailField,
});

// TODO: explain this
export const otpFlowEnum = z.enum(["signup", "password-reset"], {
  message: otpFlowMessage,
});

export const tokenPayloadSchema = z.object({
  userId: z.number(),
  email: emailFormatSchema,
});

export const userPublicSchema = z.object({
  id: z.number(),
  email: emailFormatSchema,
  username: z.string(),
});

const authErrorSchema = z.object({
  field: z.string().min(1),
  message: z.string().min(1),
});

export const authResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    user: userPublicSchema,
    message: z.string().optional(),
  }),
  z.object({
    ok: z.literal(false),
    message: z.string().optional(),
    errors: z.array(authErrorSchema).min(1),
  }),
]);

/**
 * TODO: add better notes
 * - not all routes need to return a user object; see `/api/auth/me`, `/api/auth/verify-email`, `/api/auth/forgot-password`
 */
export const formResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    message: z.string().optional(),
  }),
  z.object({
    ok: z.literal(false),
    message: z.string().optional(),
    errors: z.array(authErrorSchema).min(1),
  }),
]);

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
export type UserPublic = z.infer<typeof userPublicSchema>;
export type AuthError = z.infer<typeof authErrorSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type FormResponse = z.infer<typeof formResponseSchema>;

/**
 * Helper function to flatten Zod validation errors into AuthError array
 */
export function flattenZodErrors(error: z.ZodError): AuthError[] {
  const { formErrors, fieldErrors } = z.flattenError(error);
  return [
    ...formErrors.map((message) => ({ field: "root", message })),
    ...Object.entries(fieldErrors).flatMap(([field, messages]) =>
      (messages as string[]).map((message) => ({ field, message }))
    ),
  ];
}

/**
 * Utility function for making JSON POST requests with schema validation
 * Throws errors that can be handled by applyFieldErrors
 */
export async function postJson<TSchema extends z.ZodTypeAny>(
  url: string,
  body: unknown,
  schema: TSchema,
  signal?: AbortSignal
): Promise<z.infer<TSchema>> {
  const res = await fetch(url, {
    method: "POST",
    signal,
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {/* fallthrough */}

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Unexpected server response. Please try again.");
  }

  const data = parsed.data;
  if (!res.ok) {
    // Extract error message from response
    let message = "Request failed";

    if (typeof data === 'object' && data !== null && 'ok' in data && !data.ok) {
      const response = data as { ok: false; message?: string; errors?: AuthError[] };
      // Get root error message or general message
      const rootError = response.errors?.find(e => e.field === "root");
      message = rootError?.message || response.message || "Request failed";
    } else if (typeof data === 'object' && data !== null && 'message' in data) {
      message = (data as { message: string }).message;
    }

    const errorWithData = new Error(message) as Error & { data?: unknown };
    // Attach the response data so applyFieldErrors can use it
    errorWithData.data = data;
    throw errorWithData;
  }

  return data;
}

/**
 * Helper to apply field errors from postJson errors to react-hook-form
 */
type SetFieldError<TField extends string> = (
  field: TField | "root" | `root.${string}`,
  error: { type: string; message: string }
) => void;

export function applyFieldErrors<TField extends string>(
  error: unknown,
  setError: SetFieldError<TField>,
  validFields: TField[]
) {
  // Default error message
  const defaultMessage = error instanceof Error ? error.message : "An error occurred";

  // Check if error has attached data with field errors
  const errorData =
    typeof error === "object" && error !== null && "data" in error
      ? (error as { data?: unknown }).data
      : undefined;

  if (!errorData || typeof errorData !== 'object' || !('ok' in errorData) || errorData.ok !== false) {
    // No structured error data, just set root error
    setError("root", { type: "server", message: defaultMessage });
    return;
  }

  const response = errorData as { ok: false; message?: string; errors?: AuthError[] };

  if (!response.errors || response.errors.length === 0) {
    // No field errors, just set root error
    setError("root", { type: "server", message: response.message || defaultMessage });
    return;
  }

  let hasFieldError = false;
  for (const authError of response.errors) {
    if (authError.field !== "root" && validFields.includes(authError.field as TField)) {
      setError(authError.field as TField, { type: "server", message: authError.message });
      hasFieldError = true;
    }
  }

  // Always set root error if no field errors were applied or if there's a root message
  if (!hasFieldError) {
    const rootError = response.errors.find(e => e.field === "root");
    const message = rootError?.message || response.message || defaultMessage;
    setError("root", { type: "server", message });
  }
}
