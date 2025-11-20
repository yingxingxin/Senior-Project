"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Stack } from "@/components/ui/spacing";
import { Body } from "@/components/ui/typography";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  handle: z
    .string()
    .min(1, "Handle is required")
    .max(100, "Handle must be 100 characters or less")
    .regex(/^[a-z0-9_-]+$/, "Handle can only contain lowercase letters, numbers, hyphens, and underscores"),
  displayName: z.string().max(255).nullable().optional(),
  tagline: z.string().max(255).nullable().optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("")),
  xUrl: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("")),
  isPublic: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    handle: string;
    display_name: string | null;
    tagline: string | null;
    bio: string | null;
    avatar_url: string | null;
    website_url: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    x_url: string | null;
    is_public: boolean;
  } | null;
  userId: string;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      handle: initialData?.handle || "",
      displayName: initialData?.display_name || null,
      tagline: initialData?.tagline || null,
      bio: initialData?.bio || null,
      avatarUrl: initialData?.avatar_url || null,
      websiteUrl: initialData?.website_url || null,
      githubUrl: initialData?.github_url || null,
      linkedinUrl: initialData?.linkedin_url || null,
      xUrl: initialData?.x_url || null,
      isPublic: initialData?.is_public ?? true,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Normalize handle to lowercase and trim
      const normalizedHandle = data.handle.toLowerCase().trim();

      const response = await fetch("/api/profile/basic", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          handle: normalizedHandle,
          // Convert empty strings to null
          displayName: data.displayName || null,
          tagline: data.tagline || null,
          bio: data.bio || null,
          avatarUrl: data.avatarUrl || null,
          websiteUrl: data.websiteUrl || null,
          githubUrl: data.githubUrl || null,
          linkedinUrl: data.linkedinUrl || null,
          xUrl: data.xUrl || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError("This handle is already taken. Please choose another.");
        } else {
          setError(result.error || "Failed to save profile");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Stack gap="default">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-success/10 p-3 text-sm text-success">
              Profile saved successfully!
            </div>
          )}

          <FormField
            control={form.control}
            name="handle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handle *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="johndoe"
                    onChange={(e) => {
                      // Auto-lowercase handle
                      field.onChange(e.target.value.toLowerCase());
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Your unique profile URL: /u/{form.watch("handle") || "handle"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="John Doe"
                  />
                </FormControl>
                <FormDescription>
                  Your public display name (defaults to handle if not set)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tagline</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Software Engineer & Open Source Enthusiast"
                  />
                </FormControl>
                <FormDescription>
                  A short tagline that appears below your name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Tell us about yourself..."
                    rows={5}
                  />
                </FormControl>
                <FormDescription>
                  A longer description about yourself
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </FormControl>
                <FormDescription>
                  URL to your profile picture (image upload coming soon)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Body className="font-semibold">Social Links</Body>

            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      type="url"
                      placeholder="https://example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      type="url"
                      placeholder="https://github.com/username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="xUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X (Twitter)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      type="url"
                      placeholder="https://x.com/username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Public Profile</FormLabel>
                  <FormDescription>
                    Allow others to view your profile
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </Stack>
      </form>
    </Form>
  );
}

