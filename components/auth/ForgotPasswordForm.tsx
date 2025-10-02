"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/auth/shared/AuthCard";
import { AuthForm } from "@/components/auth/shared/AuthForm";
import { OtpForm } from "@/components/auth/shared/OtpForm";
import { AuthSuccess } from "@/components/auth/shared/AuthSuccess";
import { authClient } from "@/src/lib/auth-client";
import {
  passwordResetRequestSchema,
  passwordResetSchema,
} from "@/src/lib/auth/schemas";
import { Muted } from "@/components/ui/typography";

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
        <AuthCard.Header>
          <AuthCard.Title>Set New Password</AuthCard.Title>
          <AuthCard.Description>Choose a strong password for your account</AuthCard.Description>
        </AuthCard.Header>

        <AuthForm {...pwForm}>
          <form onSubmit={onSavePassword} noValidate aria-busy={pwForm.formState.isSubmitting}>
            <AuthForm.Body>
              {pwForm.formState.errors.root && (
                <AuthForm.RootError message={pwForm.formState.errors.root.message} />
              )}
              <AuthForm.Fieldset disabled={pwForm.formState.isSubmitting}>
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
              </AuthForm.Fieldset>

              <AuthForm.Actions>
                <AuthForm.Button
                  type="submit"
                  isLoading={pwForm.formState.isSubmitting}
                  loadingText="Saving..."
                >
                  Save new password
                </AuthForm.Button>
              </AuthForm.Actions>
            </AuthForm.Body>
          </form>
        </AuthForm>
      </>
    );
  }

  // email
  return (
    <>
      <AuthCard.Header>
        <AuthCard.Title>Forgot Password?</AuthCard.Title>
        <AuthCard.Description>We&apos;ll send a verification code if your email exists</AuthCard.Description>
      </AuthCard.Header>

      <div className="space-y-6">
        <AuthForm {...emailForm}>
          <form onSubmit={onSendCode} noValidate aria-busy={emailForm.formState.isSubmitting}>
            <AuthForm.Body>
              {emailForm.formState.errors.root && (
                <AuthForm.RootError message={emailForm.formState.errors.root.message} />
              )}

              <AuthForm.Fieldset disabled={emailForm.formState.isSubmitting}>
                <AuthForm.EmailField
                  control={emailForm.control}
                  name="email"
                  label="Email address"
                  placeholder="you@example.com"
                />
              </AuthForm.Fieldset>

              <AuthForm.Actions>
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
              </AuthForm.Actions>
            </AuthForm.Body>
          </form>
        </AuthForm>
      </div>
    </>
  );
}
