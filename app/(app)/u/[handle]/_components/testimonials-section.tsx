"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Testimonial {
  id: number;
  body: string;
  created_at: Date;
  author_user_id: number;
  author_handle: string;
  author_display_name: string | null;
  author_avatar_url: string | null;
}

interface TestimonialsSectionProps {
  recipientUserId: number;
  testimonials: Testimonial[];
  isOwner: boolean;
  canWrite: boolean; // User is logged in and is friends with profile owner
  accentColor?: string;
}

export function TestimonialsSection({
  recipientUserId,
  testimonials: initialTestimonials,
  isOwner,
  canWrite,
  accentColor,
}: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = React.useState(initialTestimonials);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [testimonialBody, setTestimonialBody] = React.useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialBody.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientUserId,
          body: testimonialBody,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create testimonial");
      }

      const { testimonial } = await res.json();
      
      // Refresh to get updated testimonials with author info
      router.refresh();
      setTestimonialBody("");
    } catch (error) {
      console.error("[Testimonials] Error:", error);
      alert(error instanceof Error ? error.message : "Failed to create testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (testimonialId: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }

    try {
      const res = await fetch(`/api/testimonials/${testimonialId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete testimonial");
      }

      setTestimonials((prev) => prev.filter((t) => t.id !== testimonialId));
    } catch (error) {
      console.error("[Testimonials] Error:", error);
      alert("Failed to delete testimonial");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle
          className="flex items-center gap-2"
          style={accentColor ? { color: accentColor } : undefined}
        >
          <MessageSquare className="h-5 w-5" />
          Testimonials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Write Testimonial Form */}
        {canWrite && (
          <div className="p-4 rounded-lg border bg-muted/30">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Body className="mb-2 text-sm font-medium">
                  Write a testimonial
                </Body>
                <Textarea
                  placeholder="Share what you think about this user..."
                  value={testimonialBody}
                  onChange={(e) => setTestimonialBody(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={!testimonialBody.trim() || isSubmitting}
                size="sm"
                style={
                  accentColor
                    ? {
                        backgroundColor: accentColor,
                        borderColor: accentColor,
                      }
                    : undefined
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Testimonials List */}
        {testimonials.length > 0 ? (
          <div className="space-y-4">
            {testimonials.map((testimonial, index) => {
              const authorDisplayName =
                testimonial.author_display_name || testimonial.author_handle;
              const initials = authorDisplayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={testimonial.id}>
                  <div className="flex items-start gap-3">
                    <Link href={`/u/${testimonial.author_handle}`}>
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={testimonial.author_avatar_url || undefined}
                          alt={authorDisplayName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <Link href={`/u/${testimonial.author_handle}`}>
                            <Heading level={5} className="mb-0.5">
                              {authorDisplayName}
                            </Heading>
                          </Link>
                          <Muted className="text-xs">
                            {new Date(testimonial.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </Muted>
                        </div>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(testimonial.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Body className="text-sm whitespace-pre-wrap">
                        {testimonial.body}
                      </Body>
                    </div>
                  </div>
                  {index < testimonials.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Body className="text-muted-foreground">
              No testimonials yet.
            </Body>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

