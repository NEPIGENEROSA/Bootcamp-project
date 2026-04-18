// 1. Elementos del DOM
const formulario = document.getElementById('formulario-tarea');
const inputTarea = document.getElementById('input-tarea');
const inputPrioridad = document.getElementById('input-prioridad'); // NUEVO
const filterPriority = document.getElementById('filter-priority'); // NUEVO
const sortTasks = document.getElementById('sort-tasks'); // NUEVO
const contenedorActivas = document.getElementById('lista-tareas-activas');
const contenedorArchivo = document.getElementById('lista-archivo');

// 2. Cargar tareas y Modo Noche desde LocalStorage
let tareas = JSON.parse(localStorage.getItem('misTareas')) || [];
if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
}

// 3. Función Modo Noche
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDark);
}

// 4. Añadir nueva tarea (MODIFICADO para incluir prioridad)
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const nuevaTarea = {
        id: Date.now(),
        titulo: inputTarea.value,
        prioridad: inputPrioridad.value, // GUARDAMOS LA PRIORIDAD
        estado: 'pendiente', 
        progreso: 0
    };
    tareas.push(nuevaTarea);
    inputTarea.value = '';
    guardarYRenderizar();
});

// Escuchadores para Filtros y Ordenación
if(filterPriority) filterPriority.addEventListener('change', renderizarTareas);
if(sortTasks) sortTasks.addEventListener('change', renderizarTareas);

// 5. Cambio de estados
function cambiarEstado(id) {
    tareas = tareas.map(t => {
        if (t.id === id) {
            if (t.estado === 'pendiente') { 
                t.estado = 'proceso'; 
                t.progreso = 20; 
            } else if (t.estado === 'proceso') { 
                t.estado = 'completada'; 
                t.progreso = 100; 
            } else { 
                t.estado = 'pendiente'; 
                t.progreso = 0; 
            }
        }
        return t;
    });
    guardarYRenderizar();
}

// 6. Actualizar el porcentaje
function actualizarProgreso(id, valor) {
    tareas = tareas.map(t => t.id === id ? {...t, progreso: parseInt(valor)} : t);
    localStorage.setItem('misTareas', JSON.stringify(tareas));
    // No renderizamos todo para no perder el foco del slider, solo actualizamos el número
    actualizarEstadisticas();
}

// 7. Eliminar
function eliminarTarea(id) {
    if (confirm('¿Estás segura de que quieres eliminar esta tarea?')) {
        tareas = tareas.filter(t => t.id !== id);
        guardarYRenderizar();
    }
}

// 8. Guardar y Refrescar
function guardarYRenderizar() {
    localStorage.setItem('misTareas', JSON.stringify(tareas));
    renderizarTareas();
}

// 9. LÓGICA DE RENDERIZADO CON FILTROS Y ORDENACIÓN
function renderizarTareas() {
    if(contenedorActivas) contenedorActivas.innerHTML = '';
    if(contenedorArchivo) contenedorArchivo.innerHTML = '';

    let tareasAMostrar = [...tareas];

    // A) APLICAR FILTRO DE PRIORIDAD
    const filtro = filterPriority ? filterPriority.value : 'all';
    if (filtro !== 'all') {
        tareasAMostrar = tareasAMostrar.filter(t => t.prioridad === filtro);
    }

    // B) APLICAR ORDENACIÓN
    const orden = sortTasks ? sortTasks.value : 'date';
    const priorityOrder = { 'Alta': 1, 'Media': 2, 'Baja': 3 };

    tareasAMostrar.sort((a, b) => {
        if (orden === 'alpha') {
            return a.titulo.localeCompare(b.titulo);
        } else if (orden === 'priority') {
            return priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
        } else {
            return b.id - a.id; // Fecha (más recientes primero)
        }
    });

    // C) SEPARAR Y DIBUJAR
    const activas = tareasAMostrar.filter(t => t.estado === 'proceso');
    const resto = tareasAMostrar.filter(t => t.estado !== 'proceso');

    activas.slice(0, 3).forEach(tarea => {
        contenedorActivas.appendChild(crearTarjetaHTML(tarea));
    });

    resto.forEach(tarea => {
        contenedorArchivo.appendChild(crearTarjetaHTML(tarea));
    });

    actualizarEstadisticas();
}

// 10. Función para crear el HTML de la tarjeta
function crearTarjetaHTML(tarea) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('data-priority', tarea.prioridad); // Importante para CSS si se necesita
    
    let controlProgreso = '';
    if (tarea.estado === 'proceso') {
        controlProgreso = `
            <div style="margin-top:10px">
                <input type="range" min="0" max="100" value="${tarea.progreso}" 
                 oninput="actualizarProgreso(${tarea.id}, this.value)">
                <span style="font-size: 0.8em">${tarea.progreso}%</span>
            </div>`;
    }

    let btnTexto = tarea.estado === 'pendiente' ? 'Empezar' : (tarea.estado === 'proceso' ? 'Finalizar' : 'Reiniciar');
    let btnIcono = tarea.estado === 'pendiente' ? 'fa-play' : (tarea.estado === 'proceso' ? 'fa-check' : 'fa-redo');

    card.innerHTML = `
        <h3 style="${tarea.estado === 'completada' ? 'text-decoration: line-through; opacity: 0.6' : ''}">
            ${tarea.titulo}
        </h3>
        <span class="badge badge-${tarea.prioridad}">${tarea.prioridad}</span>
        <div class="progress-container">
            <div class="progress-bar" style="width: ${tarea.progreso}%"></div>
        </div>
        ${controlProgreso}
        <div style="margin-top:15px">
            <button onclick="cambiarEstado(${tarea.id})">
                <i class="fas ${btnIcono}"></i> ${btnTexto}
            </button>
            <button style="background:#ff4757; margin-left:10px" onclick="eliminarTarea(${tarea.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return card;
}

// 11. Estadísticas
function actualizarEstadisticas() {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.estado === 'completada').length;
    const enProceso = tareas.filter(t => t.estado === 'proceso').length;
    const pendientes = total - completadas - enProceso;

    if(document.getElementById('total-tareas')) document.getElementById('total-tareas').innerText = total;
    if(document.getElementById('completadas-tareas')) document.getElementById('completadas-tareas').innerText = completadas;
    if(document.getElementById('en-proceso-tareas')) document.getElementById('en-proceso-tareas').innerText = enProceso;
    if(document.getElementById('pendientes-tareas')) document.getElementById('pendientes-tareas').innerText = pendientes;
}

// Inicio
renderizarTareas();