"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/src/lib/utils";

import {
  completeUserOnboarding,
  resetUserOnboarding,
  setUserOnboardingStep,
  updateUserRole,
} from "../../../app/admin/users/[userId]/actions";

// TODO: Import from schema.ts
type OnboardingStep = "welcome" | "gender" | "skill_quiz" | "persona" | "guided_intro";

interface UserActionsProps {
  userId: number;
  user: {
    role: "user" | "admin";
    onboarding_completed_at: Date | null;
    onboarding_step: string | null;
  };
  className?: string;
}

export function UserActions({ userId, user, className }: UserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState<OnboardingStep | null>(null);

  const handleResetOnboarding = async () => {
    setIsLoading(true);
    try {
      await resetUserOnboarding(userId);
      router.refresh();
    } catch (error) {
      console.error("Failed to reset onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetStep = async () => {
    if (!selectedStep) return;
    setIsLoading(true);
    try {
      await setUserOnboardingStep(userId, selectedStep);
      router.refresh();
    } catch (error) {
      console.error("Failed to set onboarding step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      await completeUserOnboarding(userId);
      router.refresh();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAdmin = async () => {
    setIsLoading(true);
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      await updateUserRole(userId, newRole);
      router.refresh();
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Onboarding controls</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetOnboarding}
            disabled={isLoading}
          >
            Reset to welcome
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompleteOnboarding}
            disabled={isLoading || Boolean(user.onboarding_completed_at)}
          >
            Mark as complete
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={selectedStep ?? undefined}
            onValueChange={(value) => setSelectedStep(value as OnboardingStep)}
          >
            <SelectTrigger className="sm:w-[220px]">
              <SelectValue placeholder="Jump to specific step" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Welcome</SelectItem>
              <SelectItem value="gender">Assistant gender</SelectItem>
              <SelectItem value="skill_quiz">Skill quiz</SelectItem>
              <SelectItem value="persona">Persona</SelectItem>
              <SelectItem value="guided_intro">Guided intro</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSetStep}
            disabled={isLoading || !selectedStep}
          >
            Set step
          </Button>
        </div>
      </div>

      <div className="space-y-3 border-t border-border/60 pt-4">
        <h4 className="text-sm font-semibold text-muted-foreground">Role management</h4>
        <Button
          variant={user.role === "admin" ? "destructive" : "default"}
          size="sm"
          onClick={handleToggleAdmin}
          disabled={isLoading}
        >
          {user.role === "admin" ? "Remove admin role" : "Promote to admin"}
        </Button>
      </div>
    </div>
  );
}
