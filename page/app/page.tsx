"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

interface ProductImage {
  url: string;
  cloudinaryId: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  images?: ProductImage[];
  category?: Category;
  colores?: string[];
  sexo?: string;
  talles?: string[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [activeSex, setActiveSex] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const sexOptions = ["Todos", "Hombre", "Mujer", "Unisex"];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Error al cargar categorías");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "Todas" ||
      (product.category && product.category.name === activeCategory);
    const matchesSex = activeSex === "Todos" || product.sexo === activeSex;
    const matchesSearch =
      searchQuery === "" ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.colores &&
        product.colores.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        ));

    return matchesCategory && matchesSex && matchesSearch;
  });

  // Valida que la URL de imagen sea utilizable por `next/image`
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
      <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 md:gap-4">
          <h1 className="text-base sm:text-xl md:text-2xl font-light tracking-[0.2em] md:tracking-[0.3em] uppercase text-gray-900 text-center">
            La Explosión Indumentaria
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white px-4 py-20 sm:py-28 md:py-48 text-center overflow-hidden"
        style={{ backgroundImage: "url('/banner.jpg')" }}
      >
        {/* Efecto de gradiente más fuerte */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 -z-10"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-600/30 rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-6 sm:mb-8">
            <HiOutlineSparkles className="text-xl sm:text-2xl text-red-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold tracking-[0.15em] sm:tracking-[0.25em] uppercase text-red-500">
              Nueva Colección
            </span>
          </div>

          {/* Título principal más imponente */}
          <h2 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-black mb-4 tracking-tight leading-none">
            <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              EXPLOSION
            </span>
            <span className="block bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent mt-2 md:mt-4">
              INDUMENTARIA
            </span>
          </h2>

          {/* Subtítulo */}
          <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto font-light leading-relaxed px-4">
            Toda la ropa que necesitas en un solo lugar{" "}
            <span className="text-white font-medium">estilo único</span> y{" "}
            <span className="text-white font-medium">calidad premium</span>
          </p>

          {/* CTA mejorado */}
          <a
            href="#productos"
            className="inline-flex items-center gap-2 sm:gap-3 bg-red-600 text-white px-8 py-4 sm:px-12 sm:py-5 rounded-full font-bold text-base sm:text-lg hover:bg-red-700 transition-all hover:scale-105 shadow-2xl hover:shadow-red-600/50 uppercase tracking-wider"
          >
            Ver Catálogo
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        {/* Decoración mejorada */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
      </section>

      {/* Category Tabs - Sticky */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-4">
          {/* Search Bar */}
          <div className="mb-3 md:mb-4">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 sm:py-2.5 pl-10 pr-4 text-sm sm:text-base border border-gray-300 rounded-full focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
              <FiSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Sex Filter */}
          <div className="flex gap-2 sm:gap-3 mb-3 md:mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {sexOptions.map((sex) => (
              <button
                key={sex}
                onClick={() => setActiveSex(sex)}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeSex === sex
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {sex}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("Todas")}
              className={`py-2.5 sm:py-3 whitespace-nowrap transition-all relative text-xs sm:text-sm ${
                activeCategory === "Todas"
                  ? "text-red-600 font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Todas
              {activeCategory === "Todas" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full"></span>
              )}
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setActiveCategory(category.name)}
                className={`py-2.5 sm:py-3 whitespace-nowrap transition-all relative text-xs sm:text-sm ${
                  activeCategory === category.name
                    ? "text-red-600 font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {category.name}
                {activeCategory === category.name && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main
        id="productos"
        className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12"
      >
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando productos...</p>
          </div>
        ) : (
          <>
            {/* Results Counter */}
            <div className="mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-gray-600">
                {filteredProducts.length === 0 ? (
                  <span className="text-red-600">
                    No se encontraron productos
                  </span>
                ) : (
                  <>
                    Mostrando{" "}
                    <span className="font-semibold">
                      {filteredProducts.length}
                    </span>{" "}
                    {filteredProducts.length === 1 ? "producto" : "productos"}
                  </>
                )}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <FiSearch className="text-4xl sm:text-6xl text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-light text-gray-900 mb-2">
                  No hay productos disponibles
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">
                  Intenta ajustar los filtros o buscar otra cosa
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("Todas");
                    setActiveSex("Todos");
                    setSearchQuery("");
                  }}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-red-600 text-white rounded-full text-sm sm:text-base font-medium hover:bg-red-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {filteredProducts.map((product) => (
                  <Link
                    key={product._id}
                    href={`/productos/${product._id}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100 mb-3 overflow-hidden rounded-lg">
                      {product.images &&
                      product.images.length > 0 &&
                      isValidImageSrc(product.images[0].url) ? (
                        <>
                          <Image
                            src={product.images[0].url}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.images.length > 1 && (
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              +{product.images.length - 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                      {/* Badge de sexo */}
                      {product.sexo && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-600/90 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full backdrop-blur-sm">
                          {product.sexo}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    {product.colores && product.colores.length > 0 && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        {product.colores[0]}
                      </p>
                    )}
                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                      ${product.price}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
