"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthForm } from "@/components/auth/shared/AuthForm";
import { OtpForm } from "@/components/auth/shared/OtpForm";
import { AuthSuccess } from "@/components/auth/shared/AuthSuccess";
import { Stack, Grid } from "@/components/ui/spacing";

import {
  signupSchema,
  type SignupInput,
} from "@/lib/auth/schemas";
import { authClient } from "@/lib/auth-client";

type Step = "form" | "otp" | "verified";

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [otpMessage, setOtpMessage] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => () => abortRef.current?.abort(), []);

  const submitSignup = signupForm.handleSubmit(async (values) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // 1) Create the account
      const { error: signUpErr } = await authClient.signUp.email(
        {
          // Better Auth docs show `name` required; use local-part if you don't collect a name.
          name: values.email.split("@")[0],
          email: values.email,
          password: values.password,
        },
        { signal: controller.signal }
      );
      if (signUpErr) throw new Error(signUpErr.message || "Sign up failed");

      // 2) Send email verification OTP (plugin overrides link-based verification)
      const { error: sendErr } = await authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "email-verification",
      });
      if (sendErr) throw new Error(sendErr.message || "Failed to send verification code");

      setPendingEmail(values.email);
      setStep("otp");

      // Clear only password fields for safety
      signupForm.reset(
        { ...signupForm.getValues(), password: "", confirmPassword: "" },
        { keepValues: true }
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Request failed";
      signupForm.setError("root", { type: "server", message: msg });
    }
  });

  const handleOtpSubmit = async (otpValue: string) => {
    // Verify email with OTP
    const { error } = await authClient.emailOtp.verifyEmail({
      email: pendingEmail,
      otp: otpValue,
    });
    if (error) {
      throw new Error(error.message || "Verification failed");
    }
    setStep("verified");
  };

  const handleOtpResend = async () => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: pendingEmail,
      type: "email-verification",
    });
    if (error) {
      throw new Error(error.message || "Failed to resend code");
    }
    setOtpMessage("Verification code resent. Check your inbox.");
  };

  if (step === "verified") {
    return (
      <AuthSuccess
        title="Email Verified!"
        message="Your email has been verified successfully. Let's set up your assistant."
        primaryAction={{ label: "Continue to Setup", onClick: () => router.push("/onboarding") }}
        secondaryAction={{ label: "Skip for Now", onClick: () => router.push("/home") }}
      />
    );
  }

  if (step === "otp") {
    return (
      <OtpForm
        email={pendingEmail}
        onSubmit={handleOtpSubmit}
        onResend={handleOtpResend}
        message={otpMessage}
      />
    );
  }

  // form
  const { control, formState: { isSubmitting, errors } } = signupForm;

  return (
    <>
      <AuthForm.RootError message={errors.root?.message} />

      <AuthForm {...signupForm}>
        <form onSubmit={submitSignup} noValidate aria-busy={isSubmitting}>
          <AuthForm.Body>
            <AuthForm.Fieldset disabled={isSubmitting}>
              <AuthForm.EmailField control={control} name="email" label="Email" />
              <AuthForm.EmailField control={control} name="confirmEmail" label="Confirm Email" />
              <AuthForm.PasswordField control={control} name="password" label="Password" autoComplete="new-password" />
              <AuthForm.PasswordField control={control} name="confirmPassword" label="Confirm Password" autoComplete="new-password" />
            </AuthForm.Fieldset>
            <AuthForm.Actions>
              <AuthForm.Button type="submit" isLoading={isSubmitting} loadingText="Creating account...">
                <UserPlus aria-hidden className="size-4" />
                Create Account
              </AuthForm.Button>
            </AuthForm.Actions>

            {/* Social sign-in */}
            <Stack gap="tight">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm sm:text-xs">
                  <span className="bg-background px-3 text-muted-foreground">or</span>
                </div>
              </div>

              <Grid cols={2} gap="tight">
                <AuthForm.Button
                  type="button"
                  variant="outline"
                  onClick={() => authClient.signIn.social({ provider: "google" })}
                  disabled={isSubmitting}
                >
                  <Image
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    className="h-5 w-5"
                    width={20}
                    height={20}
                  />
                  <span className="ml-2">Google</span>
                </AuthForm.Button>

                <AuthForm.Button
                  type="button"
                  variant="outline"
                  onClick={() => authClient.signIn.social({ provider: "github" })}
                  disabled={isSubmitting}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">GitHub</span>
                </AuthForm.Button>
              </Grid>
            </Stack>
          </AuthForm.Body>
        </form>
      </AuthForm>
    </>
  );
}
