// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Obtener todas (GET)
router.get('/', taskController.getAllTasks);

// Crear una (POST)
router.post('/', taskController.createTask);

// Actualizar una tarea específica por su ID (PUT)
router.put('/:id', taskController.updateTask);

// Borrar una tarea específica por su ID (DELETE)
router.delete('/:id', taskController.deleteTask);

module.exports = router;