# API de Productos - Documentación

Esta API permite gestionar productos con imágenes alojadas en Cloudinary y datos en MongoDB Atlas.

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# MongoDB Atlas - Obtén tu URI desde https://cloud.mongodb.com
MONGODB_URI="mongodb+srv://<usuario>:<clave>@cluster0.mongodb.net/mi-db?retryWrites=true&w=majority"

# Cloudinary - Obtén desde https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"

# Upload preset unsigned para subida directa desde el frontend
# Crea un preset en Cloudinary Console > Settings > Upload > Add upload preset
CLOUDINARY_UPLOAD_PRESET="tu_upload_preset_unsigned"
```

## Instalación

```bash
cd page
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints

### 1. Obtener configuración de Cloudinary para el frontend

**GET** `/api/cloudinary/preset`

Devuelve el `cloudName` y `uploadPreset` necesarios para que el frontend suba imágenes directamente a Cloudinary.

**Respuesta:**
```json
{
  "cloudName": "tu_cloud_name",
  "uploadPreset": "tu_upload_preset"
}
```

**Ejemplo con curl:**
```bash
curl http://localhost:3000/api/cloudinary/preset
```

---

### 2. Listar todos los productos

**GET** `/api/products`

Lista todos los productos ordenados por fecha de creación (más recientes primero).

**Respuesta:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Remera Explosion",
    "price": 1299,
    "description": "Remera de algodón premium",
    "imageUrl": "https://res.cloudinary.com/...",
    "cloudinaryId": "products/abc123",
    "createdAt": "2025-12-21T10:00:00.000Z",
    "updatedAt": "2025-12-21T10:00:00.000Z"
  }
]
```

**Ejemplo con curl:**
```bash
curl http://localhost:3000/api/products
```

---

### 3. Crear un producto

**POST** `/api/products`

Crea un nuevo producto. La imagen debe subirse primero a Cloudinary desde el frontend.

**Body (JSON):**
```json
{
  "title": "Remera Explosion",
  "price": 1299,
  "description": "Remera de algodón premium",
  "imageUrl": "https://res.cloudinary.com/tu_cloud/image/upload/v1234567890/products/abc123.jpg",
  "cloudinaryId": "products/abc123"
}
```

**Campos:**
- `title` (string, requerido): Nombre del producto
- `price` (number, requerido): Precio del producto (positivo)
- `description` (string, opcional): Descripción del producto
- `imageUrl` (string, opcional): URL completa de la imagen en Cloudinary
- `cloudinaryId` (string, opcional): ID público de Cloudinary para poder eliminar la imagen después

**Respuesta exitosa (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Remera Explosion",
  "price": 1299,
  "description": "Remera de algodón premium",
  "imageUrl": "https://res.cloudinary.com/...",
  "cloudinaryId": "products/abc123",
  "createdAt": "2025-12-21T10:00:00.000Z",
  "updatedAt": "2025-12-21T10:00:00.000Z"
}
```

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Remera Explosion",
    "price": 1299,
    "description": "Remera de algodón premium",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "cloudinaryId": "sample"
  }'
```

---

### 4. Eliminar un producto

**DELETE** `/api/products?id=<product_id>`

Elimina un producto por su ID. También intenta eliminar la imagen asociada en Cloudinary si existe.

**Query params:**
- `id` (string, requerido): ID del producto en MongoDB

**Respuesta exitosa (200):**
```json
{
  "ok": true
}
```

**Ejemplo con curl:**
```bash
curl -X DELETE "http://localhost:3000/api/products?id=507f1f77bcf86cd799439011"
```

---

## Flujo de subida de imágenes (Opción A - Directa desde el frontend)

### Paso 1: Obtener configuración de Cloudinary

```javascript
const response = await fetch('/api/cloudinary/preset');
const { cloudName, uploadPreset } = await response.json();
```

### Paso 2: Subir imagen directamente a Cloudinary

```javascript
const formData = new FormData();
formData.append('file', imageFile); // archivo del input
formData.append('upload_preset', uploadPreset);

const uploadResponse = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  {
    method: 'POST',
    body: formData,
  }
);

const imageData = await uploadResponse.json();
// imageData.secure_url -> URL de la imagen
// imageData.public_id -> ID para eliminar después
```

### Paso 3: Crear el producto con los datos de la imagen

```javascript
const productResponse = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Remera Explosion',
    price: 1299,
    description: 'Descripción del producto',
    imageUrl: imageData.secure_url,
    cloudinaryId: imageData.public_id,
  }),
});

const product = await productResponse.json();
```

---

## Ejemplo completo de componente React/Next.js

```typescript
'use client';

import { useState } from 'react';

export default function ProductForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('image') as File;
    const title = formData.get('title') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string;

    try {
      // 1. Obtener configuración de Cloudinary
      const configRes = await fetch('/api/cloudinary/preset');
      const { cloudName, uploadPreset } = await configRes.json();

      // 2. Subir imagen a Cloudinary
      let imageUrl = '';
      let cloudinaryId = '';

      if (file) {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', uploadPreset);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: uploadData }
        );
        const imageData = await uploadRes.json();
        imageUrl = imageData.secure_url;
        cloudinaryId = imageData.public_id;
      }

      // 3. Crear producto en el backend
      const productRes = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price, description, imageUrl, cloudinaryId }),
      });

      const product = await productRes.json();
      alert('Producto creado: ' + product.title);
    } catch (err) {
      console.error(err);
      alert('Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input type="text" name="title" placeholder="Título" required />
      <input type="number" name="price" placeholder="Precio" required />
      <textarea name="description" placeholder="Descripción" />
      <input type="file" name="image" accept="image/*" />
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Producto'}
      </button>
    </form>
  );
}
```

---

## Configuración de Cloudinary (Upload Preset Unsigned)

Para permitir subidas directas desde el frontend sin exponer tus API keys:

1. Ve a https://cloudinary.com/console
2. Settings > Upload
3. Scroll hasta "Upload presets"
4. Click "Add upload preset"
5. Configura:
   - **Preset name**: `explosion_products` (o el nombre que quieras)
   - **Signing Mode**: Unsigned
   - **Folder**: `products` (opcional, organiza tus imágenes)
   - **Upload manipulations**: configura tamaño máximo, formatos permitidos, etc.
6. Guarda y copia el nombre del preset
7. Pega el nombre en tu `.env` como `CLOUDINARY_UPLOAD_PRESET`

---

## Errores comunes

### Error: "MONGODB_URI no está definida"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Asegúrate de que la variable está correctamente escrita

### Error de conexión a MongoDB
- Verifica que la IP de tu máquina está en la whitelist de MongoDB Atlas
- Ve a Atlas > Network Access > Add IP Address > Allow Access from Anywhere (para desarrollo)

### Error al subir a Cloudinary desde el frontend
- Verifica que el upload preset está configurado como "Unsigned"
- Confirma que el `cloudName` y `uploadPreset` son correctos

---

## Próximos pasos recomendados

- [ ] Agregar autenticación (JWT o NextAuth)
- [ ] Implementar paginación en GET /api/products
- [ ] Agregar búsqueda y filtros
- [ ] Implementar endpoint PUT para actualizar productos
- [ ] Agregar validación de tamaño/tipo de imagen en el frontend
- [ ] Implementar manejo de errores más detallado
- [ ] Agregar tests unitarios y de integración
