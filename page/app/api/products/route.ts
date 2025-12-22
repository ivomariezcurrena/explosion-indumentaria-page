import { NextResponse } from "next/server";
import connectMongo from "../../lib/mongodb";
import Product from "../../models/products";
import { destroy as cloudDestroy } from "../../lib/cloudinary";
import { validateProduct, sanitizeProductInput, validateProductUpdate } from "../../utils/validate";

export async function GET() {
  await connectMongo();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await connectMongo();
  try {
    const body = await req.json();
    const sanitized = sanitizeProductInput(body);
    const validation = validateProduct(sanitized);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors }, { status: 400 });
    }

    const product = await Product.create(sanitized);
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await connectMongo();
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'falta id' }, { status: 400 });

    const sanitized: any = {};
    if (updates.title) sanitized.title = String(updates.title).trim();
    if (updates.price != null) sanitized.price = Number(updates.price);
    if (updates.description != null) sanitized.description = String(updates.description).trim();
    if (updates.imageUrl != null) sanitized.imageUrl = String(updates.imageUrl).trim();
    if (updates.cloudinaryId != null) sanitized.cloudinaryId = String(updates.cloudinaryId).trim();
    if (updates.talles != null) sanitized.talles = Array.isArray(updates.talles) ? updates.talles.map((s: any) => String(s).trim()) : [];
    if (updates.colores != null) sanitized.colores = Array.isArray(updates.colores) ? updates.colores.map((s: any) => String(s).trim()) : [];
    if (updates.sexo != null) sanitized.sexo = String(updates.sexo).trim();

    const validation = validateProductUpdate(sanitized);
    if (!validation.valid) return NextResponse.json({ error: validation.errors }, { status: 400 });

    const product = await Product.findByIdAndUpdate(id, sanitized, { new: true });
    if (!product) return NextResponse.json({ error: 'no encontrado' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await connectMongo();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "falta id" }, { status: 400 });

    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: "no encontrado" }, { status: 404 });

    if (product.cloudinaryId) {
      try {
        await cloudDestroy(product.cloudinaryId);
      } catch (e) {
        // no block deletion of DB if cloudinary fails
        console.error("Error borrando en Cloudinary:", e);
      }
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
