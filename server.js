const express = require('express');
const cors = require('cors');
// 1. Importamos nuestra configuración validada
const config = require('./src/config/env'); 
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 2. Prefijo profesional con versión (Fase B)
app.use('/api/v1/tasks', taskRoutes);

// Middleware de Error Global (Mejorado para Fase C)
app.use((err, req, res, next) => {
    console.error(`[Error Log]: ${err.message}`);
    
    // Si el error es el que lanzaremos desde el servicio
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Recurso no encontrado' });
    }

    res.status(500).json({ 
        message: "Error interno del servidor",
        // Solo enviamos el detalle si NO estamos en producción (Seguridad)
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 3. Usamos el puerto validado
app.listen(config.port, () => {
    console.log(`✅ Servidor de Ingeniería corriendo en el puerto ${config.port}`);
    console.log(`🚀 API disponible en http://localhost:${config.port}/api/v1/tasks`);
});