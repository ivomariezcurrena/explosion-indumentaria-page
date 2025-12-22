# Explosion Indumentaria - E-commerce

Aplicación web con Next.js para gestionar productos de indumentaria con imágenes alojadas en Cloudinary y base de datos en MongoDB Atlas.

## 🚀 Características

- ✅ API REST completa para productos (CRUD)
- ✅ Subida directa de imágenes a Cloudinary desde el frontend
- ✅ Base de datos MongoDB Atlas (cloud)
- ✅ Componentes React para crear y listar productos
- ✅ TypeScript para mayor seguridad
- ✅ Validación de datos

## 📋 Requisitos previos

- Node.js 18+ instalado
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)
- Cuenta en [Cloudinary](https://cloudinary.com/) (gratis)

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ivomariezcurrena/explosion-indumentaria-page.git
cd explosion-indumentaria-page/page
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto `page/` con el siguiente contenido:

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

#### Cómo obtener las credenciales:

**MongoDB Atlas:**
1. Ve a https://cloud.mongodb.com y crea una cuenta
2. Crea un cluster gratuito
3. En "Database Access", crea un usuario con contraseña
4. En "Network Access", añade tu IP (o 0.0.0.0/0 para desarrollo)
5. En "Database", click en "Connect" > "Connect your application"
6. Copia la cadena de conexión y reemplaza `<usuario>` y `<clave>`

**Cloudinary:**
1. Ve a https://cloudinary.com y crea una cuenta
2. En el Dashboard encontrarás `Cloud Name`, `API Key` y `API Secret`
3. Ve a Settings > Upload > Add upload preset
   - Signing Mode: **Unsigned**
   - Folder: `products` (opcional)
   - Guarda y copia el nombre del preset

### 4. Ejecutar en desarrollo


```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del proyecto

```
page/
├── app/
│   ├── api/
│   │   ├── products/          # Endpoints CRUD de productos
│   │   │   └── route.ts
│   │   └── cloudinary/        # Endpoint para configuración de Cloudinary
│   │       └── preset/
│   │           └── route.ts
│   ├── components/            # Componentes React
│   │   ├── ProductForm.tsx    # Formulario para crear productos
│   │   └── ProductList.tsx    # Lista de productos
│   ├── lib/                   # Helpers y utilidades
│   │   ├── mongodb.ts         # Conexión a MongoDB
│   │   └── cloudinary.ts      # Configuración de Cloudinary
│   ├── models/                # Modelos de datos
│   │   └── products.ts        # Esquema de producto (Mongoose)
│   ├── utils/                 # Utilidades
│   │   └── validate.ts        # Validaciones
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── docs/
│   └── API.md                 # Documentación completa de la API
├── .env                       # Variables de entorno (no subir a git)
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### `GET /api/cloudinary/preset`
Obtiene la configuración de Cloudinary para el frontend.

### `GET /api/products`
Lista todos los productos.

### `POST /api/products`
Crea un nuevo producto.

**Body:**
```json
{
  "title": "Remera Explosion",
  "price": 1299,
  "description": "Descripción opcional",
  "imageUrl": "https://res.cloudinary.com/...",
  "cloudinaryId": "products/abc123"
}
```

### `DELETE /api/products?id=<product_id>`
Elimina un producto por ID.

📖 **Documentación completa:** Ver [`docs/API.md`](docs/API.md)

## 🎨 Componentes de ejemplo

Incluye dos componentes listos para usar:

- **`ProductForm.tsx`**: Formulario para crear productos con subida de imágenes
- **`ProductList.tsx`**: Lista de productos con opción de eliminar

Puedes importarlos en tu página:

```tsx
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';

export default function Home() {
  return (
    <main>
      <ProductForm />
      <ProductList />
    </main>
  );
}
```

## 🧪 Probar la API con curl

```bash
# Listar productos
curl http://localhost:3000/api/products

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Remera Test",
    "price": 999,
    "description": "Producto de prueba"
  }'

# Eliminar producto
curl -X DELETE "http://localhost:3000/api/products?id=PRODUCT_ID"
```

## 🛠️ Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **MongoDB Atlas** - Base de datos NoSQL en la nube
- **Mongoose** - ODM para MongoDB
- **Cloudinary** - Almacenamiento de imágenes
- **Tailwind CSS** - Estilos (opcional)

## 📝 Notas importantes

- El archivo `.env` **nunca** debe subirse a git (ya está en `.gitignore`)
- Las imágenes se suben directamente a Cloudinary desde el frontend (opción más liviana)
- MongoDB Atlas tiene 512MB gratis, suficiente para proyectos pequeños
- Cloudinary tiene 25GB de almacenamiento gratis

## 🚀 Próximos pasos

- [ ] Agregar autenticación (NextAuth.js)
- [ ] Implementar paginación
- [ ] Agregar búsqueda y filtros
- [ ] Implementar actualización de productos (PUT)
- [ ] Agregar categorías y tags
- [ ] Implementar carrito de compras

## 📚 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Mongoose Docs](https://mongoosejs.com/docs/)

## 📄 Licencia

MIT

---

Desarrollado con ❤️ para Explosion Indumentaria

