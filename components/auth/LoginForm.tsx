"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
    router.push("/home");
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
                isLoading={isSubmitting}
                loadingText="Signing in..."
              >
                <LogIn aria-hidden className="size-4" /> 
                Sign In
              </AuthForm.Button>
            </AuthForm.Actions>

            {/* Social sign-in */}
            <div className="mt-6 space-y-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                <AuthForm.Button
                  type="button"
                  variant="secondary"
                  onClick={() => authClient.signIn.social({ provider: "google" })}
                  disabled={isSubmitting}
                >
                  {/* TODO: Replace with CDN image */}
                  <Image
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google logo"
                    className="mr-2 h-4 w-4"
                    width={16}
                    height={16}
                  />
                  Google
                </AuthForm.Button>

                <AuthForm.Button
                  type="button"
                  variant="secondary"
                  onClick={() => authClient.signIn.social({ provider: "github" })}
                  disabled={isSubmitting}
                >
                  {/* TODO: Replace with CDN image */}
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </AuthForm.Button>
              </div>
            </div>
          </AuthForm.Body>
        </form>
      </AuthForm>
    </>
  );
}
