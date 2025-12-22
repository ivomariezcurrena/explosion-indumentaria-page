# 🚀 Guía Rápida - Explosion Indumentaria API

## Configuración inicial (hazlo una vez)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar MongoDB Atlas
1. Ir a https://cloud.mongodb.com
2. Crear cluster gratuito
3. Database Access → Create Database User
4. Network Access → Add IP Address → Allow from Anywhere
5. Database → Connect → Connect your application → Copiar URI

### 3. Configurar Cloudinary
1. Ir a https://cloudinary.com/console
2. Copiar: Cloud Name, API Key, API Secret
3. Settings → Upload → Add upload preset
   - Signing Mode: **Unsigned**
   - Folder: `products`
   - Copiar nombre del preset

### 4. Crear archivo `.env`
```env
MONGODB_URI="mongodb+srv://usuario:clave@cluster0.mongodb.net/mi-db?retryWrites=true&w=majority"
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
CLOUDINARY_UPLOAD_PRESET="tu_preset_unsigned"
```

### 5. Verificar configuración
```bash
npm run test:config
```

---

## Desarrollo diario

### Iniciar servidor
```bash
npm run dev
```
Abre: http://localhost:3000

### Probar API con curl
```bash
# Listar productos
curl http://localhost:3000/api/products

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Remera","price":1299}'

# Eliminar producto
curl -X DELETE "http://localhost:3000/api/products?id=PRODUCT_ID"
```

### Probar API con script
```bash
./scripts/test-api.sh
```

---

## Estructura de archivos importante

```
app/
├── api/
│   ├── products/route.ts        ← CRUD de productos
│   └── cloudinary/preset/route.ts  ← Config para frontend
├── components/
│   ├── ProductForm.tsx          ← Crear productos
│   └── ProductList.tsx          ← Listar productos
├── lib/
│   ├── mongodb.ts               ← Conexión BD
│   └── cloudinary.ts            ← Config Cloudinary
├── models/
│   └── products.ts              ← Esquema de producto
└── utils/
    └── validate.ts              ← Validaciones
```

---

## Endpoints de la API

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/cloudinary/preset` | Config para frontend |
| GET | `/api/products` | Listar productos |
| POST | `/api/products` | Crear producto |
| DELETE | `/api/products?id=X` | Eliminar producto |

---

## Flujo de creación de producto (frontend)

```typescript
// 1. Obtener config de Cloudinary
const { cloudName, uploadPreset } = await fetch('/api/cloudinary/preset').then(r => r.json());

// 2. Subir imagen a Cloudinary
const formData = new FormData();
formData.append('file', imageFile);
formData.append('upload_preset', uploadPreset);

const uploadRes = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  { method: 'POST', body: formData }
);
const { secure_url, public_id } = await uploadRes.json();

// 3. Crear producto en el backend
await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Remera',
    price: 1299,
    imageUrl: secure_url,
    cloudinaryId: public_id
  })
});
```

---

## Componentes listos para usar

```tsx
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';

export default function Page() {
  return (
    <>
      <ProductForm />
      <ProductList />
    </>
  );
}
```

---

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Verificar configuración
npm run test:config

# Probar API
./scripts/test-api.sh

# Build producción
npm run build

# Iniciar producción
npm start
```

---

## Solución de problemas comunes

### ❌ "MONGODB_URI no está definida"
→ Verifica que `.env` existe y tiene la variable

### ❌ Error de conexión a MongoDB
→ Revisa Network Access en MongoDB Atlas (IP whitelisted)

### ❌ Error 401 en Cloudinary
→ Verifica API Key y API Secret en `.env`

### ❌ Upload desde frontend falla
→ Verifica que el preset es **Unsigned** en Cloudinary

---

## Links útiles

- 📖 Documentación completa: `docs/API.md`
- 🔗 MongoDB Atlas: https://cloud.mongodb.com
- 🔗 Cloudinary: https://cloudinary.com/console
- 🔗 Next.js Docs: https://nextjs.org/docs

---

✨ **Tip:** Usa `ProductForm` y `ProductList` como punto de partida y personaliza según tu diseño.
