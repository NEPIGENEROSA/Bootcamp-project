// src/config/env.js
require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    // Aquí podrías añadir claves de DB, API keys, etc.
};

// VALIDACIÓN MANUAL (Lo que pide el profe)
if (!process.env.PORT) {
    console.error("❌ ERROR: El puerto no está definido en el archivo .env");
    throw new Error('El puerto no está definido'); 
}

module.exports = config;