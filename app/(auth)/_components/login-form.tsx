"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SocialButtons } from "@/app/(auth)/_components/social-buttons";
import { Button } from "@/components/ui/button";
import { Form, EmailField, PasswordField, RootError } from "@/components/ui/form";
import { Stack } from "@/components/ui/spacing";
import { loginSchema, type LoginInput } from "@/app/(auth)/_lib/schemas";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const { handleSubmit, setError, formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = handleSubmit(async (values) => {
    // Better Auth client call replaces your postJson(...)
    const { error } = await authClient.signIn.email(
      { email: values.email, password: values.password },
      {
        onError: (ctx) => {
          // Example: email not verified or wrong creds
          // 403 is common when requireEmailVerification is enabled
          // Map to form errors
          setError("root.serverError", { type: "server", message: ctx.error.message });
        },
      }
    );

    if (error) {
      // Fallback mapping for other errors
      const msg = error.message || "Sign in failed";
      setError("root.serverError", { type: "server", message: msg });
      return;
    }

    // Success: session cookie is set by the client fetch
    router.push("/home");
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
        <Stack gap="default">
          <RootError />

          <Stack gap="tight" as="fieldset" {...({ disabled: isSubmitting } as React.FieldsetHTMLAttributes<HTMLFieldSetElement>)}>
            <EmailField name="email" label="Email" />

            <PasswordField
              name="password"
              label="Password"
              autoComplete="current-password"
              extra={
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary underline hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>
              }
            />
          </Stack>

          <Stack gap="tight">
            <Button
              type="submit"
              className="w-full h-14 sm:h-12 text-lg sm:text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn aria-hidden className="size-4" />
                  Sign In
                </>
              )}
            </Button>
          </Stack>

          <SocialButtons disabled={isSubmitting} />
        </Stack>
      </form>
    </Form>
  );
}
