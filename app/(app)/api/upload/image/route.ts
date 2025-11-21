import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import {
  uploadToR2,
  isValidImageType,
  isValidFileSize,
} from "@/src/lib/cloudflare-r2";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "images";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (!isValidFileSize(file.size, 5)) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const result = await uploadToR2(buffer, file.name, file.type, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (err) {
    console.error("Failed to upload image:", err);

    // Provide more specific error messages
    if (err instanceof Error) {
      if (err.message.includes("is not set")) {
        return NextResponse.json(
          { error: "Server configuration error. Please contact administrator." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
