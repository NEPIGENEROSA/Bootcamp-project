// src/controllers/taskController.js
const taskService = require('../services/taskService');

const getAllTasks = (req, res) => {
    // El controlador solo orquestas: pide datos al servicio y los envía en JSON
    res.json(taskService.getAll());
};

const createTask = (req, res) => {
    const { title, priority } = req.body;

    // Validación: "La Frontera de Red"
    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "El título es obligatorio" });
    }

    const newTask = taskService.create(title, priority);
    res.status(201).json(newTask);
};

const deleteTask = (req, res) => {
    const deleted = taskService.remove(req.params.id);
    if (deleted) return res.status(204).send(); // 204 No Content (Semántica pura)
    res.status(404).json({ error: "Tarea no encontrada" });
};

const updateTask = (req, res) => {
    const updated = taskService.update(req.params.id, req.body);
    if (updated) return res.json(updated);
    res.status(404).json({ error: "No se pudo actualizar" });
};

module.exports = { getAllTasks, createTask, deleteTask, updateTask };