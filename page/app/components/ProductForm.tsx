// Ejemplo de componente para crear productos
// Este es un ejemplo básico que puedes personalizar según tu diseño

'use client';

import { useState } from 'react';

interface ProductFormData {
  title: string;
  price: number;
  description: string;
  image: File | null;
}

export default function ProductForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const file = formData.get('image') as File;
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;

    try {
      // 1. Obtener firma (signed upload) del backend y subir la imagen firmada
      let imageUrl = '';
      let cloudinaryId = '';

      if (file && file.size > 0) {
        // Pedimos la firma al backend
        const signRes = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: 'products' }),
        });
        if (!signRes.ok) throw new Error('Error al obtener la firma de subida');
        const signData = await signRes.json();
        const { signature, timestamp, apiKey, cloudName } = signData as {
          signature?: string;
          timestamp?: number;
          apiKey?: string;
          cloudName?: string;
        };
        if (!signature || !timestamp || !apiKey || !cloudName) throw new Error('Respuesta de firma inválida');

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('api_key', apiKey);
        uploadData.append('timestamp', String(timestamp));
        uploadData.append('signature', signature);
        if (signData.folder) {
          uploadData.append('folder', String(signData.folder));
        }

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: uploadData,
        });
        if (!uploadRes.ok) {
          const txt = await uploadRes.text();
          throw new Error('Error subiendo a Cloudinary: ' + txt);
        }
        const imageData = await uploadRes.json();
        imageUrl = imageData.secure_url;
        cloudinaryId = imageData.public_id;
      }

      // 3. Crear producto en el backend
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          price, 
          description, 
          imageUrl, 
          cloudinaryId,
          // campos extra de ropa
          talles: formData.getAll('talles')?.map((v:any) => String(v)) || [],
          colores: formData.getAll('colores')?.map((v:any) => String(v)) || [],
          sexo: (formData.get('sexo') as string) || undefined,
        }),
      });

      if (!productRes.ok) {
        const error = await productRes.json();
        throw new Error(error.error || 'Error al crear producto');
      }

      const product = await productRes.json();
      setMessage(`✅ Producto "${product.title}" creado exitosamente`);
      
      // Limpiar formulario
      (e.target as HTMLFormElement).reset();
      
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
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Imagen
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos: JPG, PNG, WebP (max 10MB)
          </p>
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
