import "server-only";

if (typeof window !== "undefined") {
  throw new Error("This module can only be executed on the server.");
}

import { put, del } from "@vercel/blob";
import {
  validateProductImageInput,
  MAX_IMAGE_BYTES,
} from "./product-image-validation";
import { safePublicImagePath } from "./security-validation";

export { MAX_IMAGE_BYTES };

export type ProcessProductImageResult =
  | { ok: true; image: string; createdBlobUrl?: string }
  | { ok: false; status: number; message: string };

export interface BlobOperations {
  put?: typeof put;
  del?: typeof del;
}

export async function processProductImage(
  imageInput: unknown,
  existingImage = "",
  ops?: BlobOperations,
): Promise<ProcessProductImageResult> {
  const validation = validateProductImageInput(imageInput, existingImage, safePublicImagePath);

  if (!validation.ok) {
    return { ok: false, status: validation.status, message: validation.message };
  }

  if (validation.data.action === "preserve" || validation.data.action === "use_existing_or_url") {
    return { ok: true, image: validation.data.image };
  }

  const { buffer, mime, safeFilename } = validation.data;
  const putFn = ops?.put ?? put;

  try {
    const blob = await putFn(safeFilename, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: mime,
    });
    return { ok: true, image: blob.url, createdBlobUrl: blob.url };
  } catch (error) {
    logBlobError("product_blob_upload", error);
    return {
      ok: false,
      status: 500,
      message: "Failed to upload product image to storage.",
    };
  }
}

function logBlobError(context: string, error: unknown) {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const developmentMessage = process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined;
  console.error(JSON.stringify({ level: "error", context, errorName, message: developmentMessage, at: new Date().toISOString() }));
}

export async function cleanupBlob(url?: string, delFn: typeof del = del) {
  if (!url) return;
  try {
    await delFn(url);
  } catch (error) {
    logBlobError("product_blob_cleanup", error);
  }
}



