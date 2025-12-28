// Ejemplo de componente para crear productos
// Este es un ejemplo básico que puedes personalizar según tu diseño

'use client';

import { useState, useEffect } from 'react';

interface ProductFormData {
  title: string;
  price: number;
  description: string;
  images: File[];
  category?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error cargando categorías:', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    try {
      // Validar que haya al menos una imagen
      if (selectedFiles.length === 0) {
        throw new Error('Debes seleccionar al menos una imagen');
      }

      // 1. Subir todas las imágenes a Cloudinary
      const images = [];
      
      for (const file of selectedFiles) {
        // Obtener firma para cada imagen
        const signRes = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: 'products' }),
        });
        if (!signRes.ok) throw new Error('Error al obtener la firma de subida');
        
        const signData = await signRes.json();
        const { signature, timestamp, apiKey, cloudName } = signData;
        if (!signature || !timestamp || !apiKey || !cloudName) {
          throw new Error('Respuesta de firma inválida');
        }

        // Subir imagen a Cloudinary
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('api_key', apiKey);
        uploadData.append('timestamp', String(timestamp));
        uploadData.append('signature', signature);
        if (signData.folder) {
          uploadData.append('folder', String(signData.folder));
        }

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: uploadData }
        );
        
        if (!uploadRes.ok) {
          const txt = await uploadRes.text();
          throw new Error('Error subiendo a Cloudinary: ' + txt);
        }
        
        const imageData = await uploadRes.json();
        images.push({
          url: imageData.secure_url,
          cloudinaryId: imageData.public_id,
        });
      }

      // 2. Crear producto en el backend
      const productData: any = {
        title,
        price,
        description,
        images,
        talles: formData.getAll('talles')?.map((v: any) => String(v)) || [],
        colores: formData.getAll('colores')?.map((v: any) => String(v)) || [],
        sexo: (formData.get('sexo') as string) || undefined,
      };

      // Agregar categoría si fue seleccionada
      if (category && category !== '') {
        productData.category = category;
      }

      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!productRes.ok) {
        const error = await productRes.json();
        throw new Error(error.error || 'Error al crear producto');
      }

      const product = await productRes.json();
      setMessage(`✅ Producto "${product.title}" creado exitosamente con ${images.length} imagen(es)`);
      
      // Limpiar formulario
      (e.target as HTMLFormElement).reset();
      setSelectedFiles([]);
      
    } catch (err) {
      console.error(err);
      setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Crear Producto</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Título *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Remera Explosion"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Categoría / Tipo
          </label>
          <select
            id="category"
            name="category"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Si no existe la categoría, créala primero en el administrador
          </p>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Precio *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 1299"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción del producto..."
          />
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium mb-1">
            Imágenes * (puedes seleccionar múltiples)
          </label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos: JPG, PNG, WebP (max 10MB cada una)
          </p>
          {selectedFiles.length > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              {selectedFiles.length} imagen(es) seleccionada(s)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creando...' : 'Crear Producto'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
