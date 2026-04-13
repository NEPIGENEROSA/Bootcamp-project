// 1. Elementos del DOM
const formulario = document.getElementById('formulario-tarea');
const inputTarea = document.getElementById('input-tarea');
// Ahora usamos dos contenedores diferentes
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

// 4. Añadir nueva tarea
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const nuevaTarea = {
        id: Date.now(),
        titulo: inputTarea.value,
        estado: 'pendiente', 
        progreso: 0
    };
    tareas.push(nuevaTarea);
    inputTarea.value = '';
    guardarYRenderizar();
});

// 5. Cambio de estados con iconos
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

// 6. Actualizar el porcentaje manualmente
function actualizarProgreso(id, valor) {
    tareas = tareas.map(t => t.id === id ? {...t, progreso: parseInt(valor)} : t);
    guardarYRenderizar();
}

// 7. Eliminar con confirmación
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

// 9. LA NUEVA LÓGICA DE RENDERIZADO (Aquí está el cambio principal)
function renderizarTareas() {
    // Limpiamos ambos contenedores
    if(contenedorActivas) contenedorActivas.innerHTML = '';
    if(contenedorArchivo) contenedorArchivo.innerHTML = '';

    // Separamos las tareas por su estado
    const activas = tareas.filter(t => t.estado === 'proceso');
    const resto = tareas.filter(t => t.estado !== 'proceso');

    // A) Dibujamos las tareas EN PROCESO (Máximo 3) en el contenedor superior
    activas.slice(0, 3).forEach(tarea => {
        const tarjeta = crearTarjetaHTML(tarea);
        contenedorActivas.appendChild(tarjeta);
    });

    // B) El resto (Pendientes y Hechas) van al ARCHIVO inferior
    resto.forEach(tarea => {
        const tarjeta = crearTarjetaHTML(tarea);
        contenedorArchivo.appendChild(tarjeta);
    });

    actualizarEstadisticas();
}

// 10. Función auxiliar para no repetir código de tarjetas
function crearTarjetaHTML(tarea) {
    const card = document.createElement('div');
    card.className = 'task-card';
    
    let controlProgreso = '';
    if (tarea.estado === 'proceso') {
        controlProgreso = `
            <div style="margin-top:10px">
                <input type="range" min="0" max="100" value="${tarea.progreso}" 
                 oninput="actualizarProgreso(${tarea.id}, this.value)">
                <span style="font-size: 0.8em">${tarea.progreso}%</span>
            </div>`;
    }

    // Definimos el texto y el icono del botón según el estado
    let btnTexto = '';
    let btnIcono = '';
    if (tarea.estado === 'pendiente') {
        btnTexto = 'Empezar';
        btnIcono = 'fa-play';
    } else if (tarea.estado === 'proceso') {
        btnTexto = 'Finalizar';
        btnIcono = 'fa-check';
    } else {
        btnTexto = 'Reiniciar';
        btnIcono = 'fa-redo';
    }

    card.innerHTML = `
        <h3 style="${tarea.estado === 'completada' ? 'text-decoration: line-through; opacity: 0.6' : ''}">
            ${tarea.titulo}
        </h3>
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

// 11. Estadísticas con IDs vinculados al nuevo HTML
function actualizarEstadisticas() {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.estado === 'completada').length;
    const enProceso = tareas.filter(t => t.estado === 'proceso').length;
    const pendientes = total - completadas - enProceso;

    // Esta es la parte que te faltaba: enviar los datos al HTML
    if(document.getElementById('total-tareas')) {
        document.getElementById('total-tareas').innerText = total;
    }
    if(document.getElementById('completadas-tareas')) {
        document.getElementById('completadas-tareas').innerText = completadas;
    }
    if(document.getElementById('en-proceso-tareas')) {
        document.getElementById('en-proceso-tareas').innerText = enProceso;
    }
    if(document.getElementById('pendientes-tareas')) {
        document.getElementById('pendientes-tareas').innerText = pendientes;
    }
}

// IMPORTANTE: Asegúrate de que esta línea esté al final de todo el archivo
renderizarTareas();