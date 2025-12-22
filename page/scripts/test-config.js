#!/usr/bin/env node

/**
 * Script para verificar que las configuraciones están correctas
 * Ejecuta: node scripts/test-config.js
 */

require('dotenv').config({ path: '.env' });

async function testConfig() {
  console.log('🔍 Verificando configuración...\n');

  // Verificar variables de entorno
  const requiredVars = [
    'MONGODB_URI',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'CLOUDINARY_UPLOAD_PRESET',
  ];

  let allPresent = true;
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: definida`);
    } else {
      console.log(`❌ ${varName}: FALTA`);
      allPresent = false;
    }
  }

  if (!allPresent) {
    console.log('\n⚠️  Faltan variables de entorno. Verifica tu archivo .env\n');
    process.exit(1);
  }

  console.log('\n📦 Probando conexión a MongoDB...');
  
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB: Conexión exitosa');
    await mongoose.disconnect();
  } catch (err) {
    console.log('❌ MongoDB: Error de conexión');
    console.error(err.message);
    process.exit(1);
  }

  console.log('\n☁️  Probando configuración de Cloudinary...');
  
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Ping a la API de Cloudinary
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary: Configuración correcta');
    console.log(`   Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   Preset: ${process.env.CLOUDINARY_UPLOAD_PRESET}`);
  } catch (err) {
    console.log('❌ Cloudinary: Error de configuración');
    console.error(err.message);
    process.exit(1);
  }

  console.log('\n🎉 Todas las configuraciones están correctas!\n');
  console.log('Próximos pasos:');
  console.log('  1. Ejecuta: npm run dev');
  console.log('  2. Abre: http://localhost:3000');
  console.log('  3. Prueba los endpoints de la API\n');
}

testConfig().catch(console.error);
