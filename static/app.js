// 1. Elementos del DOM
const formulario = document.getElementById('formulario-tarea');
const inputTarea = document.getElementById('input-tarea');
const inputPrioridad = document.getElementById('input-prioridad');
const filterPriority = document.getElementById('filter-priority');
const sortTasks = document.getElementById('sort-tasks');
const contenedorActivas = document.getElementById('lista-tareas-activas');
const contenedorArchivo = document.getElementById('lista-archivo');

// ✅ RUTA CORREGIDA: Sin localhost para que funcione en Vercel y móvil
const API_URL = '/api/v1/tasks'; 
let tareas = [];

// 2. Cargar Modo Noche desde LocalStorage
if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
}

// 3. Función Modo Noche
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDark);
}

// --- FUNCIÓN: CARGAR TAREAS DEL SERVIDOR ---
async function cargarTareas() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            tareas = await response.json();
            renderizarTareas();
        }
    } catch (error) {
        console.error("Error al cargar tareas:", error);
    }
}

// 4. Añadir nueva tarea (CORREGIDO)
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nuevaTarea = {
        title: inputTarea.value, 
        priority: inputPrioridad.value,
        estado: 'pendiente', 
        progreso: 0
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTarea)
        });

        if (response.ok) {
            inputTarea.value = '';
            await cargarTareas(); // Recargamos la lista actualizada
        } else {
            alert("Error al guardar en el servidor");
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("Parece que el servidor no responde.");
    }
});

// Escuchadores para Filtros y Ordenación
if(filterPriority) filterPriority.addEventListener('change', renderizarTareas);
if(sortTasks) sortTasks.addEventListener('change', renderizarTareas);

// 5. Cambio de estados
function cambiarEstado(id) {
    // Nota: Para que sea permanente deberías hacer un PUT al servidor. 
    // De momento lo gestionamos en local para que veas el cambio.
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
    renderizarTareas();
}

// 6. Actualizar el porcentaje
function actualizarProgreso(id, valor) {
    tareas = tareas.map(t => t.id === id ? {...t, progreso: parseInt(valor)} : t);
    actualizarEstadisticas();
}

// 7. Eliminar (CORREGIDO: Sin localhost)
async function eliminarTarea(id) {
    if (!confirm("¿Seguro que quieres borrarla?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await cargarTareas(); 
        } else {
            alert("No se pudo borrar la tarea.");
        }
    } catch (error) {
        console.error("Error al borrar:", error);
    }
}

// 9. LÓGICA DE RENDERIZADO
function renderizarTareas() {
    if(contenedorActivas) contenedorActivas.innerHTML = '';
    if(contenedorArchivo) contenedorArchivo.innerHTML = '';

    let tareasAMostrar = [...tareas];

    // A) Filtro
    const filtro = filterPriority ? filterPriority.value : 'all';
    if (filtro !== 'all') {
        tareasAMostrar = tareasAMostrar.filter(t => t.priority === filtro);
    }

    // B) Ordenación
    const orden = sortTasks ? sortTasks.value : 'date';
    const priorityOrder = { 'Alta': 1, 'Media': 2, 'Baja': 3 };

    tareasAMostrar.sort((a, b) => {
        if (orden === 'alpha') {
            return (a.title || "").localeCompare(b.title || "");
        } else if (orden === 'priority') {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else {
            return b.id - a.id; 
        }
    });

    // C) Dibujar
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

// 10. Crear HTML de la tarjeta
function crearTarjetaHTML(tarea) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('data-priority', tarea.priority);
    
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
            ${tarea.title}
        </h3>
        <span class="badge badge-${tarea.priority}">${tarea.priority}</span>
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
cargarTareas();