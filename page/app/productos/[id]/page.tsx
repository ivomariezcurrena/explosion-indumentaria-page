"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { HiOutlineSparkles } from "react-icons/hi2";

interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  colores?: string[];
  sexo?: string;
  talles?: string[];
}

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error al cargar producto");
      const data = await res.json();
      const found = data.find((p: Product) => p._id === productId);
      if (!found) throw new Error("Producto no encontrado");
      setProduct(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const isValidImageSrc = (src?: string) => {
    if (!src) return false;
    const s = String(src).trim();
    if (s.length === 0) return false;
    if (s.toLowerCase() === "null") return false;
    return (
      s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <HiOutlineSparkles className="text-3xl text-red-600" />
            <h1 className="text-xl font-light tracking-[0.3em] uppercase text-gray-900">
              La Explosión Indumentaria
            </h1>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Volver al catálogo
          </Link>
        </div>
      </header>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando producto...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <HiOutlineSparkles className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-light text-gray-900 mb-2">{error}</h3>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
            >
              Volver al catálogo
            </Link>
          </div>
        ) : !product ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Producto no encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images Section */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden rounded-lg">
                {isValidImageSrc(product.imageUrl) ? (
                  <Image
                    src={product.imageUrl as string}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Thumbnails - mostrar solo si hay imagen */}
              {isValidImageSrc(product.imageUrl) && (
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setSelectedImage(0)}
                    className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-lg ring-2 ring-red-600"
                  >
                    <Image
                      src={product.imageUrl as string}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Category/Sexo */}
              {product.sexo && (
                <span className="text-sm text-red-600 font-medium mb-2 uppercase tracking-wider">
                  {product.sexo}
                </span>
              )}

              {/* Title */}
              <h1 className="text-4xl font-light text-gray-900 mb-2">
                {product.title}
              </h1>

              {/* Color */}
              {product.colores && product.colores.length > 0 && (
                <p className="text-lg text-gray-500 mb-6">
                  {product.colores[0]}
                </p>
              )}

              {/* Price */}
              <div className="mb-8">
                <span className="text-3xl font-semibold text-gray-900">
                  ${product.price}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

              {/* Size Selector */}
              {product.talles && product.talles.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-900 uppercase tracking-wider">
                      Talle
                    </label>
                  </div>
                  <div className="grid grid-cols-6 gap-3">
                    {product.talles.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                          selectedSize === size
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-900"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <label className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4 block">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-900 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-lg font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-900 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Whatsapp */}
              {/* WhatsApp Button — abre WhatsApp con mensaje prellenado */}
              <button
                onClick={() => {
                  const shopPhone = "5492804833866".replace(/\D/g, "");
                  if (!shopPhone) {
                    alert("Número de WhatsApp del comercio no configurado.");
                    return;
                  }

                  const size = selectedSize || "-";
                  const text = `Hola, quiero consultar por *${product.title}* ( Talle: ${size}. Cantidad: ${quantity}. ${window.location.href}`;
                  const url = `https://wa.me/${shopPhone}?text=${encodeURIComponent(
                    text
                  )}`;
                  window.open(url, "_blank");
                }}
                disabled={
                  product.talles && product.talles.length > 0 && !selectedSize
                }
                className={`w-full py-4 rounded-full font-medium text-white transition-all mb-4 ${
                  !product.talles || product.talles.length === 0 || selectedSize
                    ? "bg-red-600 hover:bg-red-700  shadow-lg hover:shadow-red-600/50 cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {product.talles && product.talles.length > 0 && !selectedSize
                  ? "Seleccioná un talle"
                  : "Contactar por WhatsApp"}
              </button>

              {/* Features */}
              {product.colores && product.colores.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">
                    Colores Disponibles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colores.map((color, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
