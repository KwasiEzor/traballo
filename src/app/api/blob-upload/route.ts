import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Token endpoint for client-side uploads to Vercel Blob. The caller must be
 * authenticated and the blob path must sit under `sites/`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("sites/")) {
          throw new Error("Chemin non autorisé.");
        }
        return {
          allowedContentTypes: ALLOWED,
          addRandomSuffix: true,
          maximumSizeInBytes: 6 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        /* client stores the returned URL in the site config */
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload refusé." },
      { status: 400 }
    );
  }
}
