"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  FiUpload,
  FiX,
  FiEye,
  FiSave,
  FiTrash2,
  FiEdit,
  FiPlus,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import {
  MdOutlineInventory,
  MdOutlineDescription,
  MdOutlineCategory,
} from "react-icons/md";

interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  cloudinaryId?: string;
  colores?: string[];
  sexo?: string;
  talles?: string[];
}

export default function AdminPanel() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    sexo: "Hombre",
    description: "",
    talles: [] as string[],
    colores: [""],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setFormData({
      title: product.title,
      price: String(product.price),
      sexo: product.sexo || "Hombre",
      description: product.description || "",
      talles: product.talles || [],
      colores:
        product.colores && product.colores.length > 0 ? product.colores : [""],
    });
    setPreviewUrl(product.imageUrl || "");
    setView("form");
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");

      setProducts(products.filter((p) => p._id !== id));
      setMessage(`✅ Producto "${title}" eliminado exitosamente`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleNewProduct = () => {
    setEditingId(null);
    setFormData({
      title: "",
      price: "",
      sexo: "Hombre",
      description: "",
      talles: [],
      colores: [""],
    });
    setImageFile(null);
    setPreviewUrl("");
    setView("form");
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      talles: prev.talles.includes(size)
        ? prev.talles.filter((s) => s !== size)
        : [...prev.talles, size],
    }));
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...formData.colores];
    newColors[index] = value;
    setFormData((prev) => ({ ...prev, colores: newColors }));
  };

  const addColor = () => {
    setFormData((prev) => ({ ...prev, colores: [...prev.colores, ""] }));
  };

  const removeColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colores: prev.colores.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imageUrl = previewUrl;
      let cloudinaryId = "";

      // Subir imagen si hay un archivo nuevo
      if (imageFile) {
        const signRes = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "products" }),
        });

        if (!signRes.ok) throw new Error("Error obteniendo firma");

        const signData = await signRes.json();
        const { signature, timestamp, apiKey, cloudName } = signData;

        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        uploadData.append("api_key", apiKey);
        uploadData.append("timestamp", String(timestamp));
        uploadData.append("signature", signature);
        if (signData.folder) uploadData.append("folder", signData.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: uploadData,
          }
        );

        if (!uploadRes.ok) throw new Error("Error subiendo imagen");

        const imageData = await uploadRes.json();
        imageUrl = imageData.secure_url;
        cloudinaryId = imageData.public_id;
      }

      const productData = {
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        imageUrl,
        cloudinaryId: cloudinaryId || undefined,
        talles: formData.talles,
        colores: formData.colores.filter((c) => c.trim() !== ""),
        sexo: formData.sexo,
      };

      // Editar o crear
      const url = editingId ? "/api/products" : "/api/products";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...productData, id: editingId } : productData;

      const productRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!productRes.ok) {
        const error = await productRes.json();
        throw new Error(error.error || "Error al guardar producto");
      }

      const product = await productRes.json();
      setMessage(
        `✅ Producto "${product.title}" ${
          editingId ? "actualizado" : "creado"
        } exitosamente`
      );

      // Limpiar formulario y volver a lista
      setFormData({
        title: "",
        price: "",
        sexo: "Hombre",
        description: "",
        talles: [],
        colores: [""],
      });
      setImageFile(null);
      setPreviewUrl("");
      setEditingId(null);

      // Recargar productos y volver a la lista
      await fetchProducts();
      setTimeout(() => setView("list"), 1500);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <HiOutlineSparkles className="text-4xl text-red-600" />
            <div>
              <h1 className="text-xl font-light tracking-[0.2em] uppercase text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                La Explosión Indumentaria
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            ← Volver al sitio
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setView("list")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === "list"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <MdOutlineInventory className="inline mr-2" />
            Ver Productos
          </button>
          <button
            onClick={handleNewProduct}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === "form"
                ? "bg-red-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiPlus className="inline mr-2" />
            {editingId ? "Editar Producto" : "Nuevo Producto"}
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Lista de Productos */}
        {view === "list" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-light text-gray-900">
                Productos ({products.length})
              </h2>
              <button
                onClick={fetchProducts}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Actualizar
              </button>
            </div>

            {loadingProducts ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                <MdOutlineInventory className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-light text-gray-900 mb-2">
                  No hay productos todavía
                </h3>
                <p className="text-gray-500 mb-6">
                  Crea tu primer producto para comenzar
                </p>
                <button
                  onClick={handleNewProduct}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <FiPlus className="inline mr-2" />
                  Crear Producto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {isValidImageSrc(product.imageUrl) ? (
                        <Image
                          src={product.imageUrl as string}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                      {product.sexo && (
                        <div className="absolute top-3 right-3 bg-red-600/90 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                          {product.sexo}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                        {product.title}
                      </h3>
                      {product.colores && product.colores.length > 0 && (
                        <p className="text-sm text-gray-500 mb-2">
                          {product.colores[0]}
                        </p>
                      )}
                      <p className="text-lg font-semibold text-gray-900 mb-3">
                        ${product.price}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <FiEdit />
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(product._id, product.title)
                          }
                          className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formulario */}
        {view === "form" && (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="text-3xl font-light text-gray-900 mb-2">
                {editingId ? "Editar Producto" : "Subir Nuevo Producto"}
              </h2>
              <p className="text-gray-600">
                {editingId
                  ? "Modifica los campos que desees actualizar"
                  : "Completa todos los campos para agregar un producto al catálogo"}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                    <MdOutlineDescription className="text-red-600 text-2xl" />
                    Información Básica
                  </h3>

                  <div className="space-y-5">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Ej: Remera Esencial Tee"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Price and Sexo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            placeholder="3900"
                            required
                            min="0"
                            step="0.01"
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sexo *
                        </label>
                        <select
                          value={formData.sexo}
                          onChange={(e) =>
                            setFormData({ ...formData, sexo: e.target.value })
                          }
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        >
                          <option value="Hombre">Hombre</option>
                          <option value="Mujer">Mujer</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe las características principales del producto..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Sizes Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                    <MdOutlineCategory className="text-red-600 text-2xl" />
                    Talles Disponibles
                  </h3>

                  <div className="grid grid-cols-6 gap-3">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                          formData.talles.includes(size)
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-900"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                    <MdOutlineInventory className="text-red-600 text-2xl" />
                    Colores
                  </h3>

                  <div className="space-y-3">
                    {formData.colores.map((color, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={color}
                          onChange={(e) =>
                            handleColorChange(index, e.target.value)
                          }
                          placeholder="Ej: Bordo, Negro, Azul"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                        />
                        {formData.colores.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeColor(index)}
                            className="px-4 py-3 text-red-600 border border-gray-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addColor}
                    className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    + Agregar color
                  </button>
                </div>

                {/* Images Upload Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                    <FiUpload className="text-red-600 text-2xl" />
                    Imagen del Producto
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-red-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setImageFile(null);
                              setPreviewUrl("");
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                          >
                            <FiX />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="text-5xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Haz clic para seleccionar una imagen
                          </p>
                          <p className="text-sm text-gray-400">
                            Soporta: JPG, PNG, WEBP, AVIF (máx. 5MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview & Actions Section */}
              <div className="space-y-6">
                {/* Preview Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                    <FiEye className="text-red-600 text-2xl" />
                    Vista Previa
                  </h3>

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {/* Preview Product Image */}
                    <div className="relative aspect-[3/4] bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUpload className="text-4xl text-gray-400" />
                      )}
                    </div>

                    {/* Preview Product Info */}
                    <div className="space-y-2">
                      <p className="text-xs text-red-600 font-medium uppercase">
                        {formData.sexo || "Sexo"}
                      </p>
                      <h4 className="text-lg font-medium text-gray-900">
                        {formData.title || "Nombre del producto"}
                      </h4>
                      {formData.colores[0] && (
                        <p className="text-sm text-gray-500">
                          {formData.colores[0]}
                        </p>
                      )}
                      <p className="text-xl font-semibold text-gray-900">
                        ${formData.price || "0"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <FiSave />
                          {editingId ? "Guardar Cambios" : "Publicar Producto"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-900 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiX />
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
