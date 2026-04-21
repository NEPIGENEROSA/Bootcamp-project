const express = require('express');
const cors = require('cors');
const path = require('path'); // Añade esta línea

// Usamos path.join para que funcione tanto en Windows como en Vercel
const config = require(path.join(__dirname, 'server/src/config/env'));
const taskRoutes = require(path.join(__dirname, 'server/src/routes/taskRoutes'));

const app = express();
// ... (el resto del código se queda igual)