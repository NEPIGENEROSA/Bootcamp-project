// 1. Estado Global: Cargamos de LocalStorage nada más empezar
let tareas = JSON.parse(localStorage.getItem('mis-tareas-v4')) || [];

// 2. Función Modo Noche (Fuera para que el botón la encuentre siempre)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDark);
}

// 3. Función para Guardar y Dibujar (La usaremos siempre)
function guardarYRenderizar() {
    localStorage.setItem('mis-tareas-v4', JSON.stringify(tareas));
    renderizarTareas();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("¡JS cargado!");
    
    // Aplicar modo noche si estaba activo
    if (localStorage.getItem('dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    const formulario = document.getElementById('formulario-tarea');
    const inputTarea = document.getElementById('input-tarea');
    const inputPrioridad = document.getElementById('input-prioridad');

    // AÑADIR TAREA
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevaTarea = {
            id: Date.now(),
            title: inputTarea.value, 
            priority: inputPrioridad.value,
            estado: 'pendiente', 
            progreso: 0
        };
        tareas.push(nuevaTarea);
        inputTarea.value = '';
        guardarYRenderizar();
    });

    // Iniciar la vista
    renderizarTareas();
});

// 4. Funciones de Gestión (Globales para los botones onclick)
window.cambiarEstado = function(id) {
    tareas = tareas.map(t => {
        if (t.id === id) {
            if (t.estado === 'pendiente') { t.estado = 'proceso'; t.progreso = 20; }
            else if (t.estado === 'proceso') { t.estado = 'completada'; t.progreso = 100; }
            else { t.estado = 'pendiente'; t.progreso = 0; }
        }
        return t;
    });
    guardarYRenderizar();
};

window.eliminarTarea = function(id) {
    if (confirm("¿Borrar tarea?")) {
        tareas = tareas.filter(t => t.id !== id);
        guardarYRenderizar();
    }
};

window.actualizarProgreso = function(id, valor) {
    tareas = tareas.map(t => t.id === id ? {...t, progreso: parseInt(valor)} : t);
    localStorage.setItem('mis-tareas-v4', JSON.stringify(tareas));
    actualizarEstadisticas();
};

// 5. Función de Renderizado (Pintar en pantalla)
function renderizarTareas() {
    const contActivas = document.getElementById('lista-tareas-activas');
    const contArchivo = document.getElementById('lista-archivo');
    
    if(!contActivas || !contArchivo) return;

    contActivas.innerHTML = '';
    contArchivo.innerHTML = '';

    tareas.forEach(tarea => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.setAttribute('data-priority', tarea.priority);
        
        let controlProgreso = tarea.estado === 'proceso' ? `
            <div style="margin-top:10px">
                <input type="range" min="0" max="100" value="${tarea.progreso}" 
                 oninput="actualizarProgreso(${tarea.id}, this.value)">
                <span>${tarea.progreso}%</span>
            </div>` : '';

        let btnTexto = tarea.estado === 'pendiente' ? 'Empezar' : (tarea.estado === 'proceso' ? 'Finalizar' : 'Reiniciar');

        card.innerHTML = `
            <h3 style="${tarea.estado === 'completada' ? 'text-decoration: line-through; opacity: 0.6' : ''}">${tarea.title}</h3>
            <span class="badge badge-${tarea.priority}">${tarea.priority}</span>
            <div class="progress-container"><div class="progress-bar" style="width: ${tarea.progreso}%"></div></div>
            ${controlProgreso}
            <div style="margin-top:15px">
                <button onclick="cambiarEstado(${tarea.id})">${btnTexto}</button>
                <button style="background:#ff4757; margin-left:10px" onclick="eliminarTarea(${tarea.id})">Eliminar</button>
            </div>`;

        if (tarea.estado === 'proceso') contActivas.appendChild(card);
        else contArchivo.appendChild(card);
    });
    actualizarEstadisticas();
}

function actualizarEstadisticas() {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.estado === 'completada').length;
    if(document.getElementById('total-tareas')) document.getElementById('total-tareas').innerText = total;
    if(document.getElementById('completadas-tareas')) document.getElementById('completadas-tareas').innerText = completadas;
}