const express = require('express');
const cors = require('cors');

// IMPORTANTE: Aquí le decimos que entre en la carpeta 'server'
const config = require('./server/src/config/env'); 
const taskRoutes = require('./server/src/routes/taskRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/tasks', taskRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
    console.log(`🚀 API lista en http://localhost:${PORT}/api/v1/tasks`);
});