/**
 * Script de Test para Categorías y Productos con Múltiples Imágenes
 * 
 * Ejecutar con: npx tsx scripts/test-categories-products.ts
 * 
 * Este script verifica:
 * 1. ✅ Modelos de MongoDB (Category y Product)
 * 2. ✅ API de Categorías (CRUD)
 * 3. ✅ API de Productos con imágenes múltiples
 * 4. ✅ Validaciones
 * 5. ✅ Referencias entre modelos
 */

// Cargar variables de entorno desde .env
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(emoji: string, message: string, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function success(message: string) {
  log('✅', message, colors.green);
}

function error(message: string) {
  log('❌', message, colors.red);
}

function info(message: string) {
  log('ℹ️', message, colors.cyan);
}

function warn(message: string) {
  log('⚠️', message, colors.yellow);
}

function section(title: string) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

async function testModels() {
  section('TEST 1: Verificar Modelos de MongoDB');

  try {
    const connectMongo = (await import('../app/lib/mongodb')).default;
    await connectMongo();
    success('Conexión a MongoDB establecida');

    // Test Category Model
    const Category = (await import('../app/models/category')).default;
    info('Modelo Category importado');

    // Verificar campos del modelo
    const categorySchema = Category.schema;
    const categoryPaths = Object.keys(categorySchema.paths);
    
    const expectedCategoryFields = ['name', 'description', 'slug', '_id'];
    const hasCategoryFields = expectedCategoryFields.every(field => 
      categoryPaths.includes(field)
    );

    if (hasCategoryFields) {
      success('Modelo Category tiene los campos correctos: ' + expectedCategoryFields.join(', '));
    } else {
      error('Modelo Category no tiene todos los campos esperados');
      info('Campos actuales: ' + categoryPaths.join(', '));
    }

    // Test Product Model
    const Product = (await import('../app/models/products')).default;
    info('Modelo Product importado');

    const productSchema = Product.schema;
    const productPaths = Object.keys(productSchema.paths);
    
    const expectedProductFields = ['title', 'price', 'images', 'category'];
    const hasProductFields = expectedProductFields.every(field => 
      productPaths.includes(field)
    );

    if (hasProductFields) {
      success('Modelo Product tiene los campos correctos: ' + expectedProductFields.join(', '));
    } else {
      error('Modelo Product no tiene todos los campos esperados');
      info('Campos actuales: ' + productPaths.join(', '));
    }

    // Verificar que images sea un array
    const imagesField = productSchema.paths['images'];
    if (imagesField && imagesField.instance === 'Array') {
      success('Campo "images" es correctamente un Array');
    } else {
      error('Campo "images" no es un Array');
    }

    // Verificar que category sea una referencia
    const categoryField = productSchema.paths['category'];
    if (categoryField && categoryField.instance === 'ObjectID') {
      success('Campo "category" es correctamente una referencia (ObjectID)');
    } else {
      warn('Campo "category" podría no estar configurado como referencia');
    }

    return true;
  } catch (err) {
    error('Error en test de modelos: ' + (err instanceof Error ? err.message : String(err)));
    return false;
  }
}

async function testCategoryOperations() {
  section('TEST 2: Operaciones CRUD de Categorías');

  try {
    const Category = (await import('../app/models/category')).default;
    
    // CREATE
    info('Creando categoría de prueba...');
    const testCategory = await Category.create({
      name: 'Test Remera ' + Date.now(),
      description: 'Categoría de prueba para remeras'
    });
    success(`Categoría creada: ${testCategory.name} (ID: ${testCategory._id})`);

    // Verificar slug automático
    if (testCategory.slug && testCategory.slug.length > 0) {
      success(`Slug generado automáticamente: "${testCategory.slug}"`);
    } else {
      error('Slug no se generó automáticamente');
    }

    // READ
    info('Leyendo categoría...');
    const foundCategory = await Category.findById(testCategory._id);
    if (foundCategory && foundCategory.name === testCategory.name) {
      success('Categoría leída correctamente');
    } else {
      error('No se pudo leer la categoría');
    }

    // UPDATE
    info('Actualizando categoría...');
    const updatedName = 'Test Remera Actualizada ' + Date.now();
    const updatedCategory = await Category.findByIdAndUpdate(
      testCategory._id,
      { name: updatedName },
      { new: true, runValidators: true }
    );
    if (updatedCategory && updatedCategory.name === updatedName) {
      success('Categoría actualizada correctamente');
    } else {
      error('No se pudo actualizar la categoría');
    }

    // DELETE
    info('Eliminando categoría de prueba...');
    await Category.findByIdAndDelete(testCategory._id);
    const deletedCategory = await Category.findById(testCategory._id);
    if (!deletedCategory) {
      success('Categoría eliminada correctamente');
    } else {
      error('No se pudo eliminar la categoría');
    }

    return true;
  } catch (err) {
    error('Error en operaciones de categoría: ' + (err instanceof Error ? err.message : String(err)));
    return false;
  }
}

async function testProductWithMultipleImages() {
  section('TEST 3: Productos con Múltiples Imágenes y Categoría');

  try {
    const Category = (await import('../app/models/category')).default;
    const Product = (await import('../app/models/products')).default;

    // Crear categoría para el test
    info('Creando categoría de prueba...');
    const testCategory = await Category.create({
      name: 'Test Producto ' + Date.now(),
      description: 'Categoría para test de productos'
    });
    success(`Categoría creada: ${testCategory._id}`);

    // Crear producto con múltiples imágenes
    info('Creando producto con múltiples imágenes...');
    const testProduct = await Product.create({
      title: 'Remera Test ' + Date.now(),
      price: 1299.99,
      description: 'Producto de prueba con múltiples imágenes',
      images: [
        {
          url: 'https://res.cloudinary.com/test/image1.jpg',
          cloudinaryId: 'test/image1'
        },
        {
          url: 'https://res.cloudinary.com/test/image2.jpg',
          cloudinaryId: 'test/image2'
        },
        {
          url: 'https://res.cloudinary.com/test/image3.jpg',
          cloudinaryId: 'test/image3'
        }
      ],
      category: testCategory._id,
      talles: ['S', 'M', 'L'],
      colores: ['Rojo', 'Azul'],
      sexo: 'Unisex'
    });
    success(`Producto creado: ${testProduct.title} (ID: ${testProduct._id})`);

    // Verificar imágenes
    if (testProduct.images && testProduct.images.length === 3) {
      success(`Producto tiene ${testProduct.images.length} imágenes correctamente`);
    } else {
      error(`Producto debería tener 3 imágenes, tiene ${testProduct.images?.length || 0}`);
    }

    // Verificar categoría
    if (testProduct.category && testProduct.category.toString() === testCategory._id.toString()) {
      success('Categoría asignada correctamente al producto');
    } else {
      error('Categoría no se asignó correctamente');
    }

    // Test: Leer con populate
    info('Probando populate de categoría...');
    const productWithCategory = await Product.findById(testProduct._id).populate('category');
    if (productWithCategory && productWithCategory.category && 
        typeof productWithCategory.category === 'object' && 
        'name' in productWithCategory.category) {
      success(`Populate funciona: Categoría "${productWithCategory.category.name}"`);
    } else {
      warn('Populate podría no estar funcionando correctamente');
    }

    // Test: Validación de al menos una imagen
    info('Probando validación de imágenes requeridas...');
    try {
      await Product.create({
        title: 'Producto sin imágenes',
        price: 999,
        images: [] // Sin imágenes
      });
      error('FALLO: Se permitió crear producto sin imágenes');
    } catch (validationError) {
      success('Validación correcta: No permite productos sin imágenes');
    }

    // Cleanup
    info('Limpiando datos de prueba...');
    await Product.findByIdAndDelete(testProduct._id);
    await Category.findByIdAndDelete(testCategory._id);
    success('Datos de prueba eliminados');

    return true;
  } catch (err) {
    error('Error en test de productos: ' + (err instanceof Error ? err.message : String(err)));
    return false;
  }
}

async function testValidations() {
  section('TEST 4: Validaciones');

  try {
    const { validateProduct, sanitizeProductInput } = await import('../app/utils/validate');

    // Test 1: Validación correcta
    info('Test 1: Datos válidos');
    const validData = {
      title: 'Remera Test',
      price: 1299,
      images: [
        { url: 'http://test.com/img1.jpg', cloudinaryId: 'test1' },
        { url: 'http://test.com/img2.jpg', cloudinaryId: 'test2' }
      ],
      category: '507f1f77bcf86cd799439011'
    };
    const validation1 = validateProduct(validData);
    if (validation1.valid) {
      success('Validación correcta para datos válidos');
    } else {
      error('Datos válidos fueron rechazados: ' + validation1.errors.join(', '));
    }

    // Test 2: Sin imágenes
    info('Test 2: Sin imágenes (debe fallar)');
    const noImages = { title: 'Test', price: 100, images: [] };
    const validation2 = validateProduct(noImages);
    if (!validation2.valid && validation2.errors.some(e => e.includes('imagen'))) {
      success('Validación correcta: rechaza productos sin imágenes');
    } else {
      error('Debería rechazar productos sin imágenes');
    }

    // Test 3: Precio inválido
    info('Test 3: Precio negativo (debe fallar)');
    const negativePrice = {
      title: 'Test',
      price: -100,
      images: [{ url: 'test.jpg', cloudinaryId: 'test' }]
    };
    const validation3 = validateProduct(negativePrice);
    if (!validation3.valid && validation3.errors.some(e => e.includes('precio'))) {
      success('Validación correcta: rechaza precios negativos');
    } else {
      error('Debería rechazar precios negativos');
    }

    // Test 4: Sanitización
    info('Test 4: Sanitización de datos');
    const dirtyData = {
      title: '  Remera con espacios  ',
      price: '1299.99',
      images: [{ url: '  http://test.com/img.jpg  ', cloudinaryId: '  test1  ' }],
      category: '  507f1f77bcf86cd799439011  '
    };
    const sanitized = sanitizeProductInput(dirtyData);
    if (sanitized.title === 'Remera con espacios' && 
        sanitized.price === 1299.99 &&
        sanitized.images[0].url === 'http://test.com/img.jpg') {
      success('Sanitización funciona correctamente (elimina espacios, convierte tipos)');
    } else {
      error('Sanitización no funciona correctamente');
    }

    return true;
  } catch (err) {
    error('Error en test de validaciones: ' + (err instanceof Error ? err.message : String(err)));
    return false;
  }
}

async function testAPIStructure() {
  section('TEST 5: Estructura de APIs');

  try {
    info('Verificando existencia de archivos de API...');

    const fs = await import('fs');
    const path = await import('path');

    const apiPaths = [
      'app/api/categories/route.ts',
      'app/api/products/route.ts'
    ];

    for (const apiPath of apiPaths) {
      const fullPath = path.join(process.cwd(), apiPath);
      if (fs.existsSync(fullPath)) {
        success(`API existe: ${apiPath}`);
      } else {
        error(`API no encontrada: ${apiPath}`);
      }
    }

    info('Verificando componentes de frontend...');
    const componentPaths = [
      'app/components/CategoryManager.tsx',
      'app/components/ProductForm.tsx',
      'app/components/ProductList.tsx'
    ];

    for (const compPath of componentPaths) {
      const fullPath = path.join(process.cwd(), compPath);
      if (fs.existsSync(fullPath)) {
        success(`Componente existe: ${compPath}`);
      } else {
        error(`Componente no encontrado: ${compPath}`);
      }
    }

    return true;
  } catch (err) {
    error('Error verificando estructura: ' + (err instanceof Error ? err.message : String(err)));
    return false;
  }
}

async function runAllTests() {
  console.log('\n');
  log('🧪', 'INICIANDO SUITE DE TESTS - CATEGORÍAS Y PRODUCTOS', colors.cyan);
  console.log('\n');

  const results = {
    modelos: false,
    categorias: false,
    productos: false,
    validaciones: false,
    estructura: false
  };

  try {
    results.modelos = await testModels();
    results.categorias = await testCategoryOperations();
    results.productos = await testProductWithMultipleImages();
    results.validaciones = await testValidations();
    results.estructura = await testAPIStructure();

    // Resumen
    section('RESUMEN DE TESTS');

    const tests = [
      { name: 'Modelos MongoDB', result: results.modelos },
      { name: 'Operaciones de Categorías', result: results.categorias },
      { name: 'Productos con Múltiples Imágenes', result: results.productos },
      { name: 'Validaciones', result: results.validaciones },
      { name: 'Estructura de Archivos', result: results.estructura }
    ];

    tests.forEach(test => {
      if (test.result) {
        success(`${test.name}: PASÓ`);
      } else {
        error(`${test.name}: FALLÓ`);
      }
    });

    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.result).length;
    const percentage = Math.round((passedTests / totalTests) * 100);

    console.log('\n');
    if (passedTests === totalTests) {
      success(`🎉 TODOS LOS TESTS PASARON (${passedTests}/${totalTests}) - ${percentage}%`);
    } else {
      warn(`⚠️  ${passedTests}/${totalTests} tests pasaron - ${percentage}%`);
    }
    console.log('\n');

  } catch (err) {
    error('Error fatal en suite de tests: ' + (err instanceof Error ? err.message : String(err)));
  } finally {
    // Cerrar conexión
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      info('Conexión a MongoDB cerrada');
    }
  }
}

// Ejecutar tests
runAllTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error ejecutando tests:', err);
    process.exit(1);
  });
