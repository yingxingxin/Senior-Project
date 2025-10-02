"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthForm } from "@/components/auth/shared/AuthForm";
import { OtpForm } from "@/components/auth/shared/OtpForm";
import { AuthSuccess } from "@/components/auth/shared/AuthSuccess";
import { authClient } from "@/src/lib/auth-client";
import {
  passwordResetRequestSchema,
  passwordResetSchema,
} from "@/src/lib/auth/schemas";
import { Heading, Muted } from "@/components/ui/typography";
import { Stack } from "@/components/ui/spacing";

type Step = "email" | "otp" | "password" | "success";

type EmailForm = z.infer<typeof passwordResetRequestSchema>;
type PasswordForm = z.infer<typeof passwordResetSchema>;


export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  // we store email in state to track the email getting password reset
  const [email, setEmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Forms
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" },
  });
  const pwForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function resetAbort() {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  }

  // Actions
  const onSendCode = emailForm.handleSubmit(async (vals) => {
    try {
      const signal = resetAbort();
      // Send password reset OTP using Better Auth's forgetPassword.emailOtp
      const { error } = await authClient.forgetPassword.emailOtp(
        { email: vals.email },
        { signal }
      );
      if (error) throw new Error(error.message || "Failed to send reset code");
      setEmail(vals.email);
      setStep("otp");
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      const message = e instanceof Error ? e.message : "Failed to send code";
      emailForm.setError("root", { type: "server", message });
    }
  });

  const handleOtpSubmit = async (code: string) => {
    // Verify the OTP
    const { error } = await authClient.emailOtp.checkVerificationOtp({
      email,
      type: "forget-password",
      otp: code,
    });
    if (error) throw new Error(error.message || "Invalid code");
    setVerifiedOtp(code);
    setStep("password");
    pwForm.reset({ password: "", confirmPassword: "" });
  };

  const handleOtpResend = async () => {
    // Resend password reset OTP
    const { error } = await authClient.forgetPassword.emailOtp(
      { email },
      { signal: resetAbort() }
    );
    if (error) throw new Error(error.message || "Failed to resend code");
    setOtpMessage("If the email exists, we sent you a new code.");
  };

  const onSavePassword = pwForm.handleSubmit(async (vals) => {
    try {
      const signal = resetAbort();
      // Reset password with the verified OTP using Better Auth's emailOtp.resetPassword
      const { error } = await authClient.emailOtp.resetPassword(
        {
          email,
          otp: verifiedOtp,
          password: vals.password,
        },
        { signal }
      );
      if (error) throw new Error(error.message || "Failed to reset password");
      setStep("success");
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      const message = e instanceof Error ? e.message : "Failed to reset password";
      pwForm.setError("root", { type: "server", message });
    }
  });


  // Views
  if (step === "success") {
    return (
      <AuthSuccess
        title="Password Reset"
        message="Your password has been reset successfully. You can now log in with your new password."
        primaryAction={{
          label: "Go to Login",
          onClick: () => router.push("/login")
        }}
        secondaryAction={{
          label: "Return Home",
          onClick: () => router.push("/")
        }}
      />
    );
  }

  if (step === "otp") {
    return (
      <OtpForm
        email={email}
        onSubmit={handleOtpSubmit}
        onResend={handleOtpResend}
        message={otpMessage}
        headerDescription={<>We sent a verification code to <strong>{email}</strong> if it exists in our system.</>}
      />
    );
  }

  if (step === "password") {
    return (
      <>
        <Stack gap="tight">
          <Heading level={1}>Set New Password</Heading>
          <Muted variant="small" as="p">Choose a strong password for your account</Muted>
        </Stack>

        <AuthForm {...pwForm}>
          <form onSubmit={onSavePassword} noValidate aria-busy={pwForm.formState.isSubmitting}>
            <Stack gap="default">
              {pwForm.formState.errors.root && (
                <AuthForm.RootError message={pwForm.formState.errors.root.message} />
              )}
              <Stack gap="tight" as="fieldset" {...({ disabled: pwForm.formState.isSubmitting } as React.FieldsetHTMLAttributes<HTMLFieldSetElement>)}>
                <AuthForm.PasswordField
                  control={pwForm.control}
                  name="password"
                  label="New password"
                  autoComplete="new-password"
                />
                <AuthForm.PasswordField
                  control={pwForm.control}
                  name="confirmPassword"
                  label="Confirm password"
                  autoComplete="new-password"
                />
              </Stack>

              <Stack gap="tight">
                <AuthForm.Button
                  type="submit"
                  isLoading={pwForm.formState.isSubmitting}
                  loadingText="Saving..."
                >
                  Save new password
                </AuthForm.Button>
              </Stack>
            </Stack>
          </form>
        </AuthForm>
      </>
    );
  }

  // email
  return (
    <>
      <Stack gap="tight">
        <Heading level={1}>Forgot Password?</Heading>
        <Muted variant="small" as="p">We&apos;ll send a verification code if your email exists</Muted>
      </Stack>

      <Stack gap="default">
        <AuthForm {...emailForm}>
          <form onSubmit={onSendCode} noValidate aria-busy={emailForm.formState.isSubmitting}>
            <Stack gap="default">
              {emailForm.formState.errors.root && (
                <AuthForm.RootError message={emailForm.formState.errors.root.message} />
              )}

              <Stack gap="tight" as="fieldset" {...({ disabled: emailForm.formState.isSubmitting } as React.FieldsetHTMLAttributes<HTMLFieldSetElement>)}>
                <AuthForm.EmailField
                  control={emailForm.control}
                  name="email"
                  label="Email address"
                  placeholder="you@example.com"
                />
              </Stack>

              <Stack gap="tight">
                <AuthForm.Button
                  type="submit"
                  isLoading={emailForm.formState.isSubmitting}
                  loadingText="Sending..."
                >
                  Send code
                </AuthForm.Button>

                <Muted variant="small" className="text-center">
                  Remember your password?{" "}
                  <Link href="/login" className="font-medium text-foreground underline hover:no-underline">
                    Log in
                  </Link>
                </Muted>
              </Stack>
            </Stack>
          </form>
        </AuthForm>
      </Stack>
    </>
  );
}
