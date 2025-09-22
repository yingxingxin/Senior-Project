"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthForm } from "@/components/auth/shared/AuthForm";
import { OtpForm } from "@/components/auth/shared/OtpForm";
import { AuthSuccess } from "@/components/auth/shared/AuthSuccess";

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
        secondaryAction={{ label: "Skip for Now", onClick: () => router.push("/explore") }}
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
              <AuthForm.Button type="submit" startIcon={<UserPlus aria-hidden className="size-4" />} isLoading={isSubmitting} loadingText="Creating account...">
                Create Account
              </AuthForm.Button>
            </AuthForm.Actions>
          </AuthForm.Body>
        </form>
      </AuthForm>
    </>
  );
}
