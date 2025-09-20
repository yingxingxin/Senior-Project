# Zod Validation Reference Guide

## Overview

This project uses [Zod](https://zod.dev) for runtime validation and TypeScript type inference across both client and server code. Zod schemas serve as the single source of truth for:

- Form validation (login, signup, password reset)
- API request/response validation
- JWT token payload verification
- Data transformation (trimming, normalization)

## Schema Architecture

### Core Schemas Location

All auth-related Zod schemas are centralized in `src/lib/auth/schemas.ts`.

### Schema Categories

#### 1. Field Primitives
Reusable field-level schemas with built-in transformations:

```typescript
emailField      // Trims, lowercases, validates email format
passwordField   // Validates minimum length requirements
```

#### 2. Form Schemas
Complete validation for auth forms:

```typescript
loginSchema           // Email + password
signupSchema          // Email + password with confirmation fields
passwordResetSchema   // New password with confirmation
```

#### 3. Route-Specific Schemas
API-specific contracts:

```typescript
resetPasswordRouteSchema      // Password reset with token
passwordResetRequestSchema    // Email for reset request
verifyEmailQuerySchema        // Email verification token
```

#### 4. Response & Token Schemas
Shared contracts for API responses and JWT payloads:

```typescript
tokenPayloadSchema    // JWT payload structure
userPublicSchema      // Public user data
authResponseSchema    // Discriminated union for API responses
```

## Usage Examples

### Client-Side Form Validation

```typescript
import { z } from "zod";
import { loginSchema } from "@/lib/auth/schemas";

const result = loginSchema.safeParse(formData);
if (!result.success) {
  const errors = z.flattenError(result.error);
  // Handle errors.formErrors and errors.fieldErrors
  return;
}

// Use result.data - it's trimmed and normalized
await fetch("/api/auth/login", {
  body: JSON.stringify(result.data)
});
```

### Server-Side API Validation

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginSchema } from "@/lib/auth/schemas";

export async function POST(request: NextRequest) {
  const result = loginSchema.safeParse(await request.json());
  if (!result.success) {
    const { formErrors, fieldErrors } = z.flattenError(result.error);
    return NextResponse.json({
      ok: false,
      errors: [...formErrors, ...Object.values(fieldErrors).flat()],
    }, { status: 400 });
  }

  const data = result.data;
  // Process validated data...
}
```

### JWT Token Validation

```typescript
import { tokenPayloadSchema } from "@/lib/auth/schemas";

export async function verifyAuthToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret, options);
  return tokenPayloadSchema.parse(payload);
}
```

## Advanced Patterns

### Transformation Pipeline
Use `.transform()` and `.pipe()` for data normalization:

```typescript
export const emailField = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .toLowerCase()
  .pipe(z.string().email({ message: "Invalid email" }));
```

### Conditional Validation
Use `.superRefine()` for cross-field validation:

```typescript
signupSchema.superRefine((data, ctx) => {
  if (data.email !== data.confirmEmail) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmEmail"],
      message: "Emails do not match",
    });
  }
});
```

### Safe Parsing Pattern
Always prefer `safeParse` over `parse` for predictable control flow:

```typescript
const result = schema.safeParse(data);
if (!result.success) {
  // Handle validation errors
  return handleError(result.error);
}
// Use result.data safely
```

## Testing Guidelines

### Schema Unit Tests
Test both success and failure cases:

```typescript
describe("loginSchema", () => {
  it("validates correct input", () => {
    const result = loginSchema.safeParse({
      email: "  User@Example.com  ",
      password: "validpassword123"
    });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("user@example.com");
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "validpassword123"
    });
    expect(result.success).toBe(false);
  });
});
```

### Integration Tests
Verify schemas work correctly in API routes:

```typescript
it("returns 400 for invalid login data", async () => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "invalid", password: "123" })
  });
  expect(response.status).toBe(400);
});
```

## Extension Guide

### Adding New Fields
1. Create reusable field schema in `schemas.ts`
2. Apply transformations (trim, lowercase, etc.)
3. Add custom refinements as needed

```typescript
export const usernameField = z
  .string()
  .trim()
  .min(3, { message: "Username too short" })
  .max(20, { message: "Username too long" })
  .regex(/^[a-zA-Z0-9_]+$/, { message: "Invalid characters" });
```

### Creating New Form Schemas
1. Compose from existing field schemas
2. Add cross-field validations with `.superRefine()`
3. Export TypeScript type via `z.infer`

```typescript
export const profileUpdateSchema = z.object({
  username: usernameField,
  email: emailField,
  bio: z.string().max(500).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
```

### API Response Contracts
Use discriminated unions for type-safe error handling:

```typescript
export const apiResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    data: someDataSchema,
    message: z.string().optional(),
  }),
  z.object({
    ok: z.literal(false),
    errors: z.array(z.string()).min(1),
  }),
]);
```

## Error Handling

### Flattening Errors
Convert Zod errors to arrays for UI display:

```typescript
const { formErrors, fieldErrors } = z.flattenError(result.error);
const allErrors = [
  ...formErrors,
  ...Object.values(fieldErrors).flat()
];
```

### Field-Level Errors
Map errors to specific form fields:

```typescript
const fieldErrorMap = z.flattenError(result.error).fieldErrors;
// fieldErrorMap.email = ["Invalid email"]
// fieldErrorMap.password = ["Too short"]
```

## Best Practices

1. **Single Source of Truth**: Define schemas once, use everywhere
2. **Transform Early**: Use schema transformations instead of manual normalization
3. **Type Inference**: Always derive types from schemas via `z.infer`
4. **Safe Parsing**: Prefer `safeParse` over `parse` for better error handling
5. **Consistent Errors**: Use `flattenError()` for consistent error shapes
6. **Validation Messages**: Keep messages user-friendly and actionable

## Migration Notes

This system replaced a manual validation approach (`validators.ts` and `types.ts`) with Zod schemas. Key improvements:

- Unified validation logic between client and server
- Automatic TypeScript type generation
- Built-in data transformation
- Better error handling with structured error objects

## Related Files

- [`src/lib/auth/schemas.ts`](/src/lib/auth/schemas.ts) - All auth schemas
- [`src/lib/auth/README.md`](/src/lib/auth/README.md) - Auth system overview
- [`src/lib/auth/jwt.ts`](/src/lib/auth/jwt.ts) - Token validation using schemas
- [`components/auth/*`](/components/auth) - Form components using schemas
- [`app/api/auth/*`](/app/api/auth) - API routes with schema validation