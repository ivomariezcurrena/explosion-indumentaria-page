import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/uploads
 * Request body (optional): { folder?: string, use_preset?: boolean }
 * Response: { signature, timestamp, apiKey, cloudName, uploadPreset }
 *
 * Frontend will use these values to perform a signed upload to Cloudinary:
 * - include `timestamp` and `signature` in the form data
 * - include `api_key` and other params (folder, upload_preset if used)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const folder = body?.folder ? String(body.folder) : undefined;
    const usePreset = body?.use_preset === true;

    const timestamp = Math.floor(Date.now() / 1000);

    // Build params to sign (only the params that Cloudinary expects to be signed)
    const paramsToSign: Record<string, string> = { timestamp: String(timestamp) };
    if (folder) paramsToSign.folder = folder;
    if (usePreset && process.env.CLOUDINARY_UPLOAD_PRESET) paramsToSign.upload_preset = String(process.env.CLOUDINARY_UPLOAD_PRESET);

    // Create the string to sign: key=value pairs sorted by key, joined with &
    const toSign = Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join("&");

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      return NextResponse.json({ error: "CLOUDINARY_API_SECRET not configured" }, { status: 500 });
    }

    const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");

    // (no debug logs in production)

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY || null,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || null,
      folder: folder || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
