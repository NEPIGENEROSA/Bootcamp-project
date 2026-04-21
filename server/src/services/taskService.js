// src/services/taskService.js
const tasks = require('../models/taskModel');

const getAll = () => tasks;

const create = (title, priority) => {
    const newTask = {
        id: Date.now(),
        title,
        priority: priority || 'Baja',
        estado: 'pendiente',
        progreso: 0
    };
    tasks.push(newTask);
    return newTask;
};

const remove = (id) => {
    const index = tasks.findIndex(t => t.id == id);
    if (index === -1) {
        // Lanzamos el error para que el middleware lo capture
        throw new Error('NOT_FOUND'); 
    }
    return tasks.splice(index, 1);
};

const update = (id, data) => {
    const task = tasks.find(t => t.id == id);
    if (task) {
        if (data.estado !== undefined) task.estado = data.estado;
        if (data.progreso !== undefined) task.progreso = parseInt(data.progreso);
        return task;
    }
    return null;
};

module.exports = { getAll, create, remove, update };