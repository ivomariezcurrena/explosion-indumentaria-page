import { NextResponse } from "next/server";
import connectMongo from "../../lib/mongodb";
import Product from "../../models/products";
import { destroy as cloudDestroy } from "../../lib/cloudinary";
import { validateProduct, sanitizeProductInput, validateProductUpdate } from "../../utils/validate";

// Helper para eliminar imágenes de Cloudinary
async function deleteProductImages(images: Array<{ cloudinaryId: string }>) {
  if (!images || !Array.isArray(images)) return;
  
  const deletePromises = images
    .filter(img => img.cloudinaryId)
    .map(async (img) => {
      try {
        await cloudDestroy(img.cloudinaryId);
      } catch (error) {
        console.error(`Error borrando imagen ${img.cloudinaryId}:`, error);
      }
    });
  
  await Promise.all(deletePromises);
}

// Helper para sanitizar actualizaciones de producto
function buildProductUpdates(updates: any) {
  const sanitized: any = {};
  
  if (updates.title) sanitized.title = String(updates.title).trim();
  if (updates.price != null) sanitized.price = Number(updates.price);
  if (updates.description != null) sanitized.description = String(updates.description).trim();
  
  if (updates.images != null) {
    sanitized.images = Array.isArray(updates.images) 
      ? updates.images.map((img: any) => ({
          url: String(img.url).trim(),
          cloudinaryId: String(img.cloudinaryId).trim(),
        }))
      : [];
  }
  
  if (updates.category !== undefined) {
    sanitized.category = updates.category ? String(updates.category).trim() : null;
  }
  
  if (updates.talles != null) {
    sanitized.talles = Array.isArray(updates.talles) 
      ? updates.talles.map((s: any) => String(s).trim()) 
      : [];
  }
  
  if (updates.colores != null) {
    sanitized.colores = Array.isArray(updates.colores) 
      ? updates.colores.map((s: any) => String(s).trim()) 
      : [];
  }
  
  if (updates.sexo != null) sanitized.sexo = String(updates.sexo).trim();
  
  return sanitized;
}

export async function GET() {
  await connectMongo();
  
  const products = await Product.find()
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean();
    
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await connectMongo();
  
  try {
    const body = await req.json();
    const sanitized = sanitizeProductInput(body);
    const validation = validateProduct(sanitized);

    // Guard: Validar datos
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
    
    // Guard: Validar ID
    if (!id) {
      return NextResponse.json({ error: 'falta id' }, { status: 400 });
    }

    const sanitized = buildProductUpdates(updates);
    const validation = validateProductUpdate(sanitized);
    
    // Guard: Validar actualizaciones
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, sanitized, { new: true });
    
    // Guard: Validar que existe el producto
    if (!product) {
      return NextResponse.json({ error: 'no encontrado' }, { status: 404 });
    }
    
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
    
    // Guard: Validar ID
    if (!id) {
      return NextResponse.json({ error: "falta id" }, { status: 400 });
    }

    const product = await Product.findById(id);
    
    // Guard: Validar que existe el producto
    if (!product) {
      return NextResponse.json({ error: "no encontrado" }, { status: 404 });
    }

    // Eliminar todas las imágenes de Cloudinary (en paralelo)
    await deleteProductImages(product.images);

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
    
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
