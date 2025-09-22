"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthForm } from "@/components/auth/shared/AuthForm";
import { loginSchema, type LoginInput } from "@/lib/auth/schemas";
import { authClient } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const { handleSubmit, control, setError, formState } = form;
  const { isSubmitting, errors } = formState;

  const onSubmit = handleSubmit(async (values) => {
    // Better Auth client call replaces your postJson(...)
    const { error } = await authClient.signIn.email(
      { email: values.email, password: values.password },
      {
        onError: (ctx) => {
          // Example: email not verified or wrong creds
          // 403 is common when requireEmailVerification is enabled
          // Map to form errors
          setError("root", { type: "server", message: ctx.error.message });
        },
      }
    );

    if (error) {
      // Fallback mapping for other errors
      const msg = error.message || "Sign in failed";
      setError("root", { type: "server", message: msg });
      return;
    }

    // Success: session cookie is set by the client fetch
    router.push("/explore");
  });

  return (
    <>
      <AuthForm.RootError message={errors.root?.message} />

      <AuthForm {...form}>
        <form onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
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

            {/* Optional: social sign-in */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <AuthForm.Button
                type="button"
                variant="secondary"
                onClick={() => authClient.signIn.social({ provider: "google" })}
              >
                Continue with Google
              </AuthForm.Button>
              <AuthForm.Button
                type="button"
                variant="secondary"
                onClick={() => authClient.signIn.social({ provider: "github" })}
              >
                Continue with GitHub
              </AuthForm.Button>
            </div>
          </AuthForm.Body>
        </form>
      </AuthForm>
    </>
  );
}
