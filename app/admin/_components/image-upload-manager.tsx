"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/src/components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { Stack } from "@/components/ui/spacing";

export function ImageUploadManager() {
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; folder: string; timestamp: Date }>>([]);
  const [selectedFolder, setSelectedFolder] = useState("general");
  const [customFolder, setCustomFolder] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleImageUploaded = (url: string) => {
    const folder = selectedFolder === "custom" ? customFolder : selectedFolder;
    setUploadedImages([
      { url, folder, timestamp: new Date() },
      ...uploadedImages,
    ]);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const folders = [
    { value: "general", label: "General" },
    { value: "profile-images", label: "Profile Images" },
    { value: "banners", label: "Banners" },
    { value: "lesson-assets", label: "Lesson Assets" },
    { value: "quiz-assets", label: "Quiz Assets" },
    { value: "custom", label: "Custom Folder" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Upload images to Cloudflare R2. Images will be publicly accessible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stack gap="default">
            <div className="space-y-2">
              <Label>Folder</Label>
              <Tabs value={selectedFolder} onValueChange={setSelectedFolder}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="profile-images">Profiles</TabsTrigger>
                  <TabsTrigger value="banners">Banners</TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-3 mt-2">
                  <TabsTrigger value="lesson-assets">Lessons</TabsTrigger>
                  <TabsTrigger value="quiz-assets">Quizzes</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {selectedFolder === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customFolder">Custom Folder Name</Label>
                <Input
                  id="customFolder"
                  value={customFolder}
                  onChange={(e) => setCustomFolder(e.target.value)}
                  placeholder="my-custom-folder"
                />
              </div>
            )}

            <ImageUpload
              currentImageUrl={null}
              onImageUploaded={handleImageUploaded}
              folder={selectedFolder === "custom" ? customFolder : selectedFolder}
              label="Select Image"
              buttonText="Upload to R2"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Recently Uploaded Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Uploaded</CardTitle>
          <CardDescription>
            Images uploaded during this session. Click to copy URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedImages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No images uploaded yet. Upload an image to get started.
            </p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {uploadedImages.map((image, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <img
                    src={image.url}
                    alt={`Uploaded ${index + 1}`}
                    className="h-16 w-16 rounded object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {image.folder}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {image.url}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(image.url)}
                      className="h-7"
                    >
                      {copiedUrl === image.url ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          Copy URL
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
