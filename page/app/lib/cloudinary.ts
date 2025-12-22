import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function destroy(publicId: string) {
  if (!publicId) return null;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res;
  } catch (err) {
    throw err;
  }
}

export function getUnsignedPreset() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
  };
}

export default cloudinary;
