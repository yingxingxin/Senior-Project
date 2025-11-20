"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Stack } from "@/components/ui/spacing";
import { Card } from "@/components/ui/card";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { z } from "zod";

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  techStack: z.string().nullable().optional(),
  linkUrl: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("")),
  orderIndex: z.number().default(0),
});

type Project = z.infer<typeof projectSchema>;

interface ProjectsFormProps {
  initialProjects: Array<{
    id: number;
    title: string;
    description: string | null;
    tech_stack: string | null;
    link_url: string | null;
    order_index: number;
  }>;
  userId: string;
}

export function ProjectsForm({ initialProjects }: ProjectsFormProps) {
  const [projects, setProjects] = useState<Project[]>(
    initialProjects.map((p) => ({
      id: p.id.toString(),
      title: p.title,
      description: p.description || null,
      techStack: p.tech_stack || null,
      linkUrl: p.link_url || null,
      orderIndex: p.order_index,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addProject = () => {
    setProjects([
      ...projects,
      {
        title: "",
        description: null,
        techStack: null,
        linkUrl: null,
        orderIndex: projects.length,
      },
    ]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index).map((p, i) => ({ ...p, orderIndex: i })));
  };

  const moveProject = (index: number, direction: "up" | "down") => {
    const newProjects = [...projects];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newProjects.length) {
      return;
    }

    [newProjects[index], newProjects[targetIndex]] = [
      newProjects[targetIndex],
      newProjects[index],
    ];

    // Update order indices
    newProjects.forEach((p, i) => {
      p.orderIndex = i;
    });

    setProjects(newProjects);
  };

  const updateProject = (index: number, field: keyof Project, value: string | null) => {
    const newProjects = [...projects];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value === "" ? null : value,
    };
    setProjects(newProjects);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate all projects
      const validatedProjects = projects.map((p) => {
        const result = projectSchema.safeParse(p);
        if (!result.success) {
          throw new Error(`Invalid project: ${result.error.issues[0]?.message}`);
        }
        return result.data;
      });

      const response = await fetch("/api/profile/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projects: validatedProjects.map((p) => ({
            ...p,
            description: p.description || null,
            techStack: p.techStack || null,
            linkUrl: p.linkUrl || null,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to save projects");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
          Projects saved successfully!
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground mb-4">No projects yet</p>
          <Button onClick={addProject} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`project-title-${index}`}>Title *</Label>
                      <Input
                        id={`project-title-${index}`}
                        value={project.title}
                        onChange={(e) =>
                          updateProject(index, "title", e.target.value)
                        }
                        placeholder="My Awesome Project"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`project-description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`project-description-${index}`}
                        value={project.description || ""}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "description",
                            e.target.value || null
                          )
                        }
                        placeholder="A brief description of your project..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`project-tech-${index}`}>
                        Tech Stack
                      </Label>
                      <Input
                        id={`project-tech-${index}`}
                        value={project.techStack || ""}
                        onChange={(e) =>
                          updateProject(index, "techStack", e.target.value || null)
                        }
                        placeholder="React, TypeScript, PostgreSQL"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`project-link-${index}`}>Link URL</Label>
                      <Input
                        id={`project-link-${index}`}
                        type="url"
                        value={project.linkUrl || ""}
                        onChange={(e) =>
                          updateProject(index, "linkUrl", e.target.value || null)
                        }
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveProject(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveProject(index, "down")}
                      disabled={index === projects.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProject(index)}
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
        <Button onClick={addProject} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All Projects
        </Button>
      </div>
    </Stack>
  );
}

