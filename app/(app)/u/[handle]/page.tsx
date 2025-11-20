import { notFound } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getUserProfileByHandle } from "@/src/db/queries/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Github, Linkedin, Globe, Twitter } from "lucide-react";
import Link from "next/link";

interface PublicProfilePageProps {
  params: Promise<{ handle: string }>;
}

/**
 * Public Profile Page
 *
 * Displays a user's public portfolio profile at /u/[handle]
 * Supports theme customization from user_profile_themes
 */
export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { handle } = await params;

  // Get profile data
  const profileData = await getUserProfileByHandle(handle);

  if (!profileData) {
    notFound();
  }

  // Check if profile is public
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isOwner = session?.user
    ? Number(session.user.id) === profileData.user_id
    : false;

  if (!profileData.is_public && !isOwner) {
    notFound();
  }

  const { theme, projects, experiences } = profileData;

  // Extract theme values
  const accentColor = theme?.accent_color || undefined;
  const backgroundImageUrl = theme?.background_image_url || undefined;
  const fontStyle = theme?.font_style || "default";

  // Generate initials from display name or handle
  const displayName = profileData.display_name || profileData.handle;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Font style mapping
  const fontClass =
    fontStyle === "mono"
      ? "font-mono"
      : fontStyle === "rounded"
        ? "font-sans"
        : "font-sans";

  return (
    <div className={`min-h-screen ${fontClass}`}>
      {/* Background Image Overlay */}
      {backgroundImageUrl && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero Section */}
        <Card className="mb-6 overflow-hidden">
          <div
            className="relative p-8"
            style={
              accentColor
                ? {
                    borderTop: `4px solid ${accentColor}`,
                  }
                : undefined
            }
          >
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage
                  src={profileData.avatar_url || undefined}
                  alt={displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-2xl text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Heading level={1} className="mb-1">
                  {displayName}
                </Heading>
                <Muted className="mb-2 text-lg">@{profileData.handle}</Muted>
                {profileData.tagline && (
                  <Body className="text-muted-foreground">
                    {profileData.tagline}
                  </Body>
                )}

                {/* Social Links */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                  {profileData.github_url && (
                    <Link
                      href={profileData.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github className="h-5 w-5" />
                      <span className="text-sm">GitHub</span>
                    </Link>
                  )}
                  {profileData.linkedin_url && (
                    <Link
                      href={profileData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="text-sm">LinkedIn</span>
                    </Link>
                  )}
                  {profileData.website_url && (
                    <Link
                      href={profileData.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Globe className="h-5 w-5" />
                      <span className="text-sm">Website</span>
                    </Link>
                  )}
                  {profileData.x_url && (
                    <Link
                      href={profileData.x_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="text-sm">X</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* About Section */}
        {profileData.bio && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle
                style={
                  accentColor
                    ? {
                        color: accentColor,
                      }
                    : undefined
                }
              >
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Body className="whitespace-pre-wrap">{profileData.bio}</Body>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle
                style={
                  accentColor
                    ? {
                        color: accentColor,
                      }
                    : undefined
                }
              >
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.map((project) => (
                  <div key={project.id}>
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Heading level={4} className="mb-1">
                          {project.title}
                        </Heading>
                        {project.description && (
                          <Body className="mb-2 text-muted-foreground">
                            {project.description}
                          </Body>
                        )}
                        {project.tech_stack && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {project.tech_stack.split(",").map((tech, idx) => (
                              <Badge key={idx} variant="outline">
                                {tech.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.link_url && (
                          <Link
                            href={project.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Globe className="h-4 w-4" />
                            View Project
                          </Link>
                        )}
                      </div>
                    </div>
                    {project.id !== projects[projects.length - 1]?.id && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {experiences && experiences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle
                style={
                  accentColor
                    ? {
                        color: accentColor,
                      }
                    : undefined
                }
              >
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="mb-2">
                      <Heading level={4} className="mb-1">
                        {exp.role}
                      </Heading>
                      <Body className="mb-1 font-semibold">
                        {exp.organization}
                      </Body>
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {exp.start_date && (
                          <span>
                            {new Date(exp.start_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                        {exp.start_date && (exp.end_date || exp.is_current) && (
                          <span>—</span>
                        )}
                        {exp.is_current ? (
                          <Badge variant="secondary">Current</Badge>
                        ) : (
                          exp.end_date && (
                            <span>
                              {new Date(exp.end_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )
                        )}
                        {exp.location && (
                          <>
                            <span>•</span>
                            <span>{exp.location}</span>
                          </>
                        )}
                      </div>
                      {exp.description && (
                        <Body className="text-muted-foreground">
                          {exp.description}
                        </Body>
                      )}
                    </div>
                    {exp.id !== experiences[experiences.length - 1]?.id && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TODO: Music player integration (if showMusicPlayer is true) */}
        {/* TODO: Assistant integration (if showAssistant is true) */}
      </div>
    </div>
  );
}

