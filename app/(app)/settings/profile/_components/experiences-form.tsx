"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Stack } from "@/components/ui/spacing";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { z } from "zod";

const experienceSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  organization: z.string().min(1, "Organization is required"),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
  orderIndex: z.number().default(0),
});

type Experience = z.infer<typeof experienceSchema>;

interface ExperiencesFormProps {
  initialExperiences: Array<{
    id: number;
    role: string;
    organization: string;
    location: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_current: boolean;
    description: string | null;
    order_index: number;
  }>;
  userId: string;
}

export function ExperiencesForm({
  initialExperiences,
  userId,
}: ExperiencesFormProps) {
  const [experiences, setExperiences] = useState<Experience[]>(
    initialExperiences.map((e) => ({
      id: e.id.toString(),
      role: e.role,
      organization: e.organization,
      location: e.location || null,
      startDate: e.start_date
        ? new Date(e.start_date).toISOString().split("T")[0]
        : null,
      endDate: e.end_date
        ? new Date(e.end_date).toISOString().split("T")[0]
        : null,
      isCurrent: e.is_current,
      description: e.description || null,
      orderIndex: e.order_index,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        role: "",
        organization: "",
        location: null,
        startDate: null,
        endDate: null,
        isCurrent: false,
        description: null,
        orderIndex: experiences.length,
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(
      experiences
        .filter((_, i) => i !== index)
        .map((e, i) => ({ ...e, orderIndex: i }))
    );
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    const newExperiences = [...experiences];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newExperiences.length) {
      return;
    }

    [newExperiences[index], newExperiences[targetIndex]] = [
      newExperiences[targetIndex],
      newExperiences[index],
    ];

    // Update order indices
    newExperiences.forEach((e, i) => {
      e.orderIndex = i;
    });

    setExperiences(newExperiences);
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string | boolean | null
  ) => {
    const newExperiences = [...experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value === "" ? null : value,
    };
    setExperiences(newExperiences);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate all experiences
      const validatedExperiences = experiences.map((e) => {
        const result = experienceSchema.safeParse(e);
        if (!result.success) {
          throw new Error(
            `Invalid experience: ${result.error.errors[0]?.message}`
          );
        }
        return result.data;
      });

      const response = await fetch("/api/profile/experiences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experiences: validatedExperiences.map((e) => ({
            ...e,
            location: e.location || null,
            startDate: e.startDate || null,
            endDate: e.isCurrent ? null : e.endDate || null,
            description: e.description || null,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to save experiences");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack gap="default">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-success/10 p-3 text-sm text-success">
          Experiences saved successfully!
        </div>
      )}

      {experiences.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">No experiences yet</p>
          <Button onClick={addExperience} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`exp-role-${index}`}>Role *</Label>
                        <Input
                          id={`exp-role-${index}`}
                          value={experience.role}
                          onChange={(e) =>
                            updateExperience(index, "role", e.target.value)
                          }
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`exp-org-${index}`}>
                          Organization *
                        </Label>
                        <Input
                          id={`exp-org-${index}`}
                          value={experience.organization}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "organization",
                              e.target.value
                            )
                          }
                          placeholder="Tech Corp"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`exp-location-${index}`}>Location</Label>
                      <Input
                        id={`exp-location-${index}`}
                        value={experience.location || ""}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "location",
                            e.target.value || null
                          )
                        }
                        placeholder="San Francisco, CA"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`exp-start-${index}`}>Start Date</Label>
                        <Input
                          id={`exp-start-${index}`}
                          type="date"
                          value={experience.startDate || ""}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "startDate",
                              e.target.value || null
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`exp-end-${index}`}>End Date</Label>
                        <Input
                          id={`exp-end-${index}`}
                          type="date"
                          value={experience.endDate || ""}
                          onChange={(e) =>
                            updateExperience(
                              index,
                              "endDate",
                              e.target.value || null
                            )
                          }
                          disabled={experience.isCurrent}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label htmlFor={`exp-current-${index}`}>
                          Current Position
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Hide end date if this is your current role
                        </p>
                      </div>
                      <Switch
                        id={`exp-current-${index}`}
                        checked={experience.isCurrent}
                        onCheckedChange={(checked) => {
                          updateExperience(index, "isCurrent", checked);
                          if (checked) {
                            updateExperience(index, "endDate", null);
                          }
                        }}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`exp-desc-${index}`}>Description</Label>
                      <Textarea
                        id={`exp-desc-${index}`}
                        value={experience.description || ""}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "description",
                            e.target.value || null
                          )
                        }
                        placeholder="Describe your responsibilities and achievements..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveExperience(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveExperience(index, "down")}
                      disabled={index === experiences.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button onClick={addExperience} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All Experiences
        </Button>
      </div>
    </Stack>
  );
}

