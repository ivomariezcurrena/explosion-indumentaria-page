export function validateProduct(data: any) {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    errors.push("El título es requerido y debe ser texto");
  }

  if (data.price == null || typeof data.price !== "number" || data.price < 0) {
    errors.push("El precio es requerido y debe ser un número positivo");
  }

  if (data.description && typeof data.description !== "string") {
    errors.push("La descripción debe ser texto");
  }

  if (data.imageUrl && typeof data.imageUrl !== "string") {
    errors.push("La URL de imagen debe ser texto");
  }

  if (data.cloudinaryId && typeof data.cloudinaryId !== "string") {
    errors.push("El ID de Cloudinary debe ser texto");
  }

  if (data.talles && !Array.isArray(data.talles)) {
    errors.push("Talles debe ser un arreglo de strings");
  }
  if (data.colores && !Array.isArray(data.colores)) {
    errors.push("Colores debe ser un arreglo de strings");
  }
  if (data.sexo && typeof data.sexo !== "string") {
    errors.push("Sexo debe ser texto");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function sanitizeProductInput(data: any) {
  return {
    title: data.title?.trim(),
    price: Number(data.price),
    description: data.description?.trim() || undefined,
    imageUrl: data.imageUrl?.trim() || undefined,
    cloudinaryId: data.cloudinaryId?.trim() || undefined,
    talles: Array.isArray(data.talles) ? data.talles.map((s: any) => String(s).trim()) : [],
    colores: Array.isArray(data.colores) ? data.colores.map((s: any) => String(s).trim()) : [],
    sexo: data.sexo?.trim() || undefined,
  };
}

export function validateProductUpdate(data: any) {
  const errors: string[] = [];
  // For update allow partial, just validate types when present
  if (data.title && typeof data.title !== 'string') errors.push('title debe ser texto');
  if (data.price != null && typeof data.price !== 'number') errors.push('price debe ser número');
  if (data.talles && !Array.isArray(data.talles)) errors.push('talles debe ser un arreglo');
  if (data.colores && !Array.isArray(data.colores)) errors.push('colores debe ser un arreglo');
  if (data.sexo && typeof data.sexo !== 'string') errors.push('sexo debe ser texto');
  return { valid: errors.length === 0, errors };
}
