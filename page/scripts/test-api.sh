#!/bin/bash

# Script para probar los endpoints de la API
# Asegúrate de que el servidor está corriendo (npm run dev)

BASE_URL="http://localhost:3000"

echo "🧪 Probando API de Productos"
echo "=============================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Probar endpoint de configuración de Cloudinary
echo "1️⃣  GET /api/cloudinary/preset"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/cloudinary/preset")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Éxito (200)${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ Error ($http_code)${NC}"
    echo "$body"
fi
echo ""

# 2. Listar productos (debería estar vacío al inicio)
echo "2️⃣  GET /api/products"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/products")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Éxito (200)${NC}"
    count=$(echo "$body" | jq 'length' 2>/dev/null || echo "?")
    echo "Productos encontrados: $count"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ Error ($http_code)${NC}"
    echo "$body"
fi
echo ""

# 3. Crear un producto de prueba (sin imagen)
echo "3️⃣  POST /api/products (crear producto de prueba)"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Remera Test",
    "price": 1299,
    "description": "Producto de prueba creado desde el script"
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ Éxito (201)${NC}"
    product_id=$(echo "$body" | jq -r '._id' 2>/dev/null)
    echo "ID del producto creado: $product_id"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ Error ($http_code)${NC}"
    echo "$body"
    product_id=""
fi
echo ""

# 4. Listar productos nuevamente (ahora debería tener 1)
if [ -n "$product_id" ]; then
    echo "4️⃣  GET /api/products (después de crear)"
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/products")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Éxito (200)${NC}"
        count=$(echo "$body" | jq 'length' 2>/dev/null || echo "?")
        echo "Productos encontrados: $count"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Error ($http_code)${NC}"
        echo "$body"
    fi
    echo ""

    # 5. Eliminar el producto de prueba
    echo "5️⃣  DELETE /api/products?id=$product_id"
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/products?id=$product_id")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Éxito (200)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Error ($http_code)${NC}"
        echo "$body"
    fi
    echo ""
fi

echo "=============================="
echo -e "${GREEN}✨ Prueba completada${NC}"
echo ""
echo "Nota: Si ves errores de conexión, asegúrate de que:"
echo "  1. El servidor está corriendo (npm run dev)"
echo "  2. Las variables de entorno están configuradas (.env)"
echo "  3. MongoDB Atlas está accesible (revisa Network Access)"
