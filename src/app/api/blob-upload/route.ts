import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 6 * 1024 * 1024;

/**
 * Server-side upload to Vercel Blob. Receives a (browser-resized) image as
 * multipart/form-data, stores it under `sites/` and returns its public URL.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "img").replace(/[^a-z0-9-]/gi, "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Formats acceptés : JPG, PNG, WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image trop lourde (max 6 Mo)." }, { status: 400 });
  }

  try {
    const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
    const blob = await put(`sites/${kind}-${Date.now()}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Échec du stockage." },
      { status: 500 }
    );
  }
}
