// Ejemplo de componente para listar y eliminar productos

'use client';

import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  cloudinaryId?: string;
  createdAt: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      
      // Actualizar lista
      setProducts(products.filter(p => p._id !== id));
      alert(`Producto "${title}" eliminado`);
    } catch (err) {
      alert('Error al eliminar: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Productos</h2>
        <button 
          onClick={fetchProducts}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Actualizar
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No hay productos todavía</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div 
              key={product._id} 
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
              )}
              
              <h3 className="font-bold text-lg mb-1">{product.title}</h3>
              <p className="text-xl text-green-600 font-semibold mb-2">
                ${product.price.toFixed(2)}
              </p>
              
              {product.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
              )}
              
              <button
                onClick={() => deleteProduct(product._id, product.title)}
                className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
