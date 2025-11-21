import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// Cloudflare R2 is S3-compatible, so we use AWS SDK
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "";

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to Cloudflare R2
 * @param file File buffer to upload
 * @param fileName Original filename
 * @param contentType MIME type of the file
 * @param folder Optional folder path within the bucket
 * @returns Object containing the public URL and key
 */
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "images"
): Promise<UploadResult> {
  // Validate environment variables
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID is not set");
  }
  if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
    throw new Error("CLOUDFLARE_R2_ACCESS_KEY_ID is not set");
  }
  if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
    throw new Error("CLOUDFLARE_R2_SECRET_ACCESS_KEY is not set");
  }
  if (!BUCKET_NAME) {
    throw new Error("CLOUDFLARE_R2_BUCKET_NAME is not set");
  }
  if (!PUBLIC_URL) {
    throw new Error("CLOUDFLARE_R2_PUBLIC_URL is not set");
  }

  // Generate unique filename
  const ext = fileName.split(".").pop();
  const uniqueFileName = `${randomUUID()}.${ext}`;
  const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

  // Upload to R2
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return public URL
  const url = `${PUBLIC_URL}/${key}`;

  return { url, key };
}

/**
 * Validate if file is an image
 */
export function isValidImageType(contentType: string): boolean {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return validTypes.includes(contentType.toLowerCase());
}

/**
 * Validate file size (max 5MB by default)
 */
export function isValidFileSize(
  size: number,
  maxSizeMB: number = 5
): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}
