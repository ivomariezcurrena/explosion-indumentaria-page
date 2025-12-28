import { NextResponse } from "next/server";
import connectMongo from "../../lib/mongodb";
import Category from "../../models/category";

// Helper para manejar errores de MongoDB
function handleMongoError(err: any) {
  if (err.code === 11000) {
    return NextResponse.json(
      { error: 'Ya existe una categoría con ese nombre' }, 
      { status: 400 }
    );
  }
  return NextResponse.json(
    { error: err?.message || String(err) }, 
    { status: 500 }
  );
}

export async function GET() {
  await connectMongo();
  
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json(categories);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectMongo();
  
  try {
    const body = await req.json();
    const { name, description } = body;

    // Guard: Validar nombre
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Construir datos de categoría
    const categoryData: any = { name: name.trim() };
    if (description) {
      categoryData.description = String(description).trim();
    }

    const category = await Category.create(categoryData);
    return NextResponse.json(category, { status: 201 });
    
  } catch (err: any) {
    return handleMongoError(err);
  }
}

export async function PUT(req: Request) {
  await connectMongo();
  
  try {
    const body = await req.json();
    const { id, name, description } = body;

    // Guard: Validar ID
    if (!id) {
      return NextResponse.json({ error: 'falta id' }, { status: 400 });
    }

    // Construir objeto de actualizaciones
    const updates: any = {};
    if (name) updates.name = String(name).trim();
    if (description !== undefined) {
      updates.description = description ? String(description).trim() : '';
    }

    // Guard: Validar que hay actualizaciones
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 });
    }

    const category = await Category.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true 
    });

    // Guard: Validar que existe la categoría
    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }

    return NextResponse.json(category);
    
  } catch (err: any) {
    return handleMongoError(err);
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

    const category = await Category.findByIdAndDelete(id);

    // Guard: Validar que existe la categoría
    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Categoría eliminada" });
    
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
