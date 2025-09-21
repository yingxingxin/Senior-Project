"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/auth/shared/AuthCard";
import { AuthForm } from "@/components/auth/shared/AuthForm";
import { OtpForm } from "@/components/auth/shared/OtpForm";
import { AuthSuccess } from "@/components/auth/shared/AuthSuccess";

// Schemas (reuse yours if already exported)
import {
  passwordResetRequestSchema,
  passwordResetSchema,
  formResponseSchema,
  postJson,
  applyFieldErrors,
} from "@/lib/auth";

type Step = "email" | "otp" | "password" | "success";

type EmailForm = z.infer<typeof passwordResetRequestSchema>;
type PasswordForm = z.infer<typeof passwordResetSchema>;


export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  // we store email in state to track the email getting password reset
  const [email, setEmail] = useState("");
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
      await postJson(
        "/api/auth/otp/request",
        { flow: "password-reset", email: vals.email },
        formResponseSchema,
        signal
      );
      setEmail(vals.email);
      setStep("otp");
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      applyFieldErrors(e, emailForm.setError, ["email"]);
    }
  });

  const handleOtpSuccess = () => {
    setStep("password");
    pwForm.reset({ password: "", confirmPassword: "" });
  };

  const onSavePassword = pwForm.handleSubmit(async (vals) => {
    try {
      const signal = resetAbort();
      await postJson(
        "/api/auth/forgot-password",
        {
          email,
          password: vals.password,
          confirmPassword: vals.confirmPassword,
        },
        formResponseSchema,
        signal
      );
      setStep("success");
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      applyFieldErrors(e, pwForm.setError, ["password", "confirmPassword"]);
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
        flow="password-reset"
        onSuccess={handleOtpSuccess}
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
              <AuthForm.RootError message={pwForm.formState.errors.root?.message} />

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
        <AuthCard.Description>Enter your email and we will send a verification code</AuthCard.Description>
      </AuthCard.Header>

      <div className="space-y-6">
        <AuthForm {...emailForm}>
          <form onSubmit={onSendCode} noValidate aria-busy={emailForm.formState.isSubmitting}>
            <AuthForm.Body>
              <AuthForm.RootError message={emailForm.formState.errors.root?.message} />

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
              </AuthForm.Actions>
            </AuthForm.Body>
          </form>
        </AuthForm>
      </div>

      <AuthCard.Footer>
        Remember your password?{" "}
        <AuthCard.FooterLink href="/login">Back to login</AuthCard.FooterLink>
      </AuthCard.Footer>
    </>
  );
}
