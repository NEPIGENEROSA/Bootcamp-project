const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

// ─── Conexión MongoDB (reutilizable entre llamadas en Vercel) ─
let client;
let db;

async function conectarDB() {
    if (db) return db; // Ya conectado, reutilizar
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('taskflow');
    console.log('✅ Conectado a MongoDB');
    return db;
}

// ─── Rutas API ────────────────────────────────────────────────

// GET /api/tareas → Obtener todas las tareas
app.get('/api/tareas', async (req, res) => {
    try {
        const db = await conectarDB();
        const tareas = await db.collection('tareas').find({}).sort({ _id: -1 }).toArray();
        res.json(tareas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener tareas' });
    }
});

// POST /api/tareas → Crear nueva tarea
app.post('/api/tareas', async (req, res) => {
    try {
        const db = await conectarDB();
        const { title, priority } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'El título es obligatorio' });
        }

        const nuevaTarea = {
            title: title.trim(),
            priority: priority || 'Media',
            estado: 'pendiente',
            progreso: 0,
            creadaEn: new Date()
        };

        const result = await db.collection('tareas').insertOne(nuevaTarea);
        nuevaTarea._id = result.insertedId;
        res.status(201).json(nuevaTarea);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear tarea' });
    }
});

// PATCH /api/tareas/:id → Actualizar estado o progreso
app.patch('/api/tareas/:id', async (req, res) => {
    try {
        const db = await conectarDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const cambios = req.body; // { estado, progreso } — lo que venga
        await db.collection('tareas').updateOne(
            { _id: new ObjectId(id) },
            { $set: cambios }
        );

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar tarea' });
    }
});

// DELETE /api/tareas/:id → Borrar tarea
app.delete('/api/tareas/:id', async (req, res) => {
    try {
        const db = await conectarDB();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        await db.collection('tareas').deleteOne({ _id: new ObjectId(id) });
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al borrar tarea' });
    }
});

// ─── Servir el HTML en cualquier otra ruta ────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// ─── Arrancar en local ────────────────────────────────────────
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
}

module.exports = app;
