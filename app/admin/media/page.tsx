import { Stack } from "@/components/ui/spacing";
import { Body } from "@/components/ui/typography";
import { ImageUploadManager } from "@/app/admin/_components/image-upload-manager";

export default async function AdminMediaPage() {
  return (
    <Stack gap="default">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Management</h1>
        <Body className="text-muted-foreground mt-2">
          Upload and manage images for your platform
        </Body>
      </div>

      <ImageUploadManager />
    </Stack>
  );
}
