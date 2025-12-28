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

  // Validar imágenes (array requerido con al menos una imagen)
  if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
    errors.push("Se requiere al menos una imagen");
  } else {
    data.images.forEach((img: any, index: number) => {
      if (!img.url || typeof img.url !== "string") {
        errors.push(`Imagen ${index + 1}: URL es requerida`);
      }
      if (!img.cloudinaryId || typeof img.cloudinaryId !== "string") {
        errors.push(`Imagen ${index + 1}: cloudinaryId es requerido`);
      }
    });
  }

  // Validar categoría (opcional)
  if (data.category && typeof data.category !== "string") {
    errors.push("La categoría debe ser un ID válido");
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
  const sanitized: any = {
    title: data.title?.trim(),
    price: Number(data.price),
    description: data.description?.trim() || undefined,
    images: Array.isArray(data.images) 
      ? data.images.map((img: any) => ({
          url: String(img.url).trim(),
          cloudinaryId: String(img.cloudinaryId).trim(),
        }))
      : [],
    talles: Array.isArray(data.talles) ? data.talles.map((s: any) => String(s).trim()) : [],
    colores: Array.isArray(data.colores) ? data.colores.map((s: any) => String(s).trim()) : [],
    sexo: data.sexo?.trim() || undefined,
  };

  if (data.category) {
    sanitized.category = String(data.category).trim();
  }

  return sanitized;
}

export function validateProductUpdate(data: any) {
  const errors: string[] = [];
  // For update allow partial, just validate types when present
  if (data.title && typeof data.title !== 'string') errors.push('title debe ser texto');
  if (data.price != null && typeof data.price !== 'number') errors.push('price debe ser número');
  
  if (data.images) {
    if (!Array.isArray(data.images)) {
      errors.push('images debe ser un arreglo');
    } else {
      data.images.forEach((img: any, index: number) => {
        if (!img.url || typeof img.url !== "string") {
          errors.push(`Imagen ${index + 1}: URL es requerida`);
        }
        if (!img.cloudinaryId || typeof img.cloudinaryId !== "string") {
          errors.push(`Imagen ${index + 1}: cloudinaryId es requerido`);
        }
      });
    }
  }

  if (data.category && typeof data.category !== 'string') errors.push('category debe ser un ID válido');
  if (data.talles && !Array.isArray(data.talles)) errors.push('talles debe ser un arreglo');
  if (data.colores && !Array.isArray(data.colores)) errors.push('colores debe ser un arreglo');
  if (data.sexo && typeof data.sexo !== 'string') errors.push('sexo debe ser texto');
  
  return { valid: errors.length === 0, errors };
}

