// 1. Elementos del DOM
const formulario = document.getElementById('formulario-tarea');
const inputTarea = document.getElementById('input-tarea');
const inputPrioridad = document.getElementById('input-prioridad');
const filterPriority = document.getElementById('filter-priority');
const sortTasks = document.getElementById('sort-tasks');
const contenedorActivas = document.getElementById('lista-tareas-activas');
const contenedorArchivo = document.getElementById('lista-archivo');

const API_URL = 'http://localhost:3000/api/v1/tasks'; // La dirección de tu backend
let tareas = [];

// 2. Cargar Modo Noche desde LocalStorage (esto sí se queda en el navegador)
if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
}

// 3. Función Modo Noche
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDark);
}

// --- NUEVA FUNCIÓN: CARGAR DESDE EL SERVIDOR ---
// Sustituye tu función de agregar por esta:
async function agregarTarea() {
    const input = document.getElementById('input-tarea');
    const prioridad = document.getElementById('select-prioridad'); // Elige el ID que tengas
    const titulo = input.value.trim();

    if (!titulo) {
        alert("¡Oye! No puedes dejar el título vacío.");
        return;
    }

    try {
        const respuesta = await fetch('http://localhost:3000/api/v1/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title: titulo, 
                priority: prioridad.value 
            })
        });

        if (respuesta.status === 201) {
            input.value = ''; // Limpiamos el input
            cargarTareas();   // Volvemos a pedir la lista al servidor para que se actualice
        } else {
            const error = await respuesta.json();
            alert("El servidor dice que algo va mal: " + error.error);
        }
    } catch (error) {
        alert("¡Vaya! Parece que el servidor está apagado.");
    }
}
// 4. Añadir nueva tarea (MODIFICADO para usar POST al servidor)
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevaTarea = {
        title: inputTarea.value, // Cambiado a 'title' para coincidir con el backend
        priority: inputPrioridad.value,
        estado: 'pendiente', 
        progreso: 0
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaTarea)
        });
        inputTarea.value = '';
        cargarTareas(); // Recargamos la lista desde el servidor
    } catch (error) {
        console.error("Error al guardar tarea:", error);
    }
});

// Escuchadores para Filtros y Ordenación
if(filterPriority) filterPriority.addEventListener('change', renderizarTareas);
if(sortTasks) sortTasks.addEventListener('change', renderizarTareas);

// 5. Cambio de estados (Próxima fase: implementar PUT en el servidor)
// De momento lo gestionamos en local y lo renderizamos
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
    renderizarTareas();
}

// 6. Actualizar el porcentaje
function actualizarProgreso(id, valor) {
    tareas = tareas.map(t => t.id === id ? {...t, progreso: parseInt(valor)} : t);
    actualizarEstadisticas();
}

// 7. Eliminar
async function borrarTarea(id) {
    // Aquí puedes poner un "confirm" si quieres ser más precavida
    if (!confirm("¿Seguro que quieres borrarla?")) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/api/v1/tasks/${id}`, {
            method: 'DELETE'
        });

        if (respuesta.status === 204) {
            console.log("Borrada con éxito (204 No Content)");
            cargarTareas(); // Refrescamos la lista
        } else {
            alert("No se pudo borrar, quizás ya no existe.");
        }
    } catch (error) {
        alert("Error de red al intentar borrar.");
    }
}
// 9. LÓGICA DE RENDERIZADO CON FILTROS Y ORDENACIÓN
function renderizarTareas() {
    if(contenedorActivas) contenedorActivas.innerHTML = '';
    if(contenedorArchivo) contenedorArchivo.innerHTML = '';

    let tareasAMostrar = [...tareas];

    // A) APLICAR FILTRO DE PRIORIDAD
    const filtro = filterPriority ? filterPriority.value : 'all';
    if (filtro !== 'all') {
        tareasAMostrar = tareasAMostrar.filter(t => t.priority === filtro);
    }

    // B) APLICAR ORDENACIÓN
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

// Inicio - Cargamos desde el servidor al abrir la web
cargarTareas();
