import { NextResponse } from "next/server";
import { getUnsignedPreset } from "../../../lib/cloudinary";

export async function GET() {
  const preset = getUnsignedPreset();
  // No exponemos keys secretas; sólo lo necesario para la subida directa
  return NextResponse.json({ cloudName: preset.cloudName, uploadPreset: preset.uploadPreset });
}
