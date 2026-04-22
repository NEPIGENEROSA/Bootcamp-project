document.addEventListener('DOMContentLoaded', () => {
    console.log("¡JS cargado y funcionando!");
    alert("V4 - SOLUCIÓN DEFINITIVA");

    // 1. Elementos del DOM
    const formulario = document.getElementById('formulario-tarea');
    const inputTarea = document.getElementById('input-tarea');
    const inputPrioridad = document.getElementById('input-prioridad');
    const filterPriority = document.getElementById('filter-priority');
    const sortTasks = document.getElementById('sort-tasks');
    const contenedorActivas = document.getElementById('lista-tareas-activas');
    const contenedorArchivo = document.getElementById('lista-archivo');

    // 2. Estado de la aplicación (Cargamos de LocalStorage para que no falle)
    let tareas = JSON.parse(localStorage.getItem('mis-tareas-v4')) || [];

    // 3. Modo Noche
    if (localStorage.getItem('dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    window.toggleDarkMode = function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('dark-mode', isDark);
    };

    // 4. AÑADIR TAREA (CORREGIDO Y SIN DEPENDER DE API EXTERNA)
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nuevaTarea = {
            id: Date.now(), // ID único
            title: inputTarea.value, 
            priority: inputPrioridad.value,
            estado: 'pendiente', 
            progreso: 0
        };

        tareas.push(nuevaTarea);
        guardarYRenderizar();
        inputTarea.value = '';
    });

    // 5. CAMBIAR ESTADO
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

    // 6. ELIMINAR
    window.eliminarTarea = function(id) {
        if (!confirm("¿Seguro que quieres borrarla?")) return;
        tareas = tareas.filter(t => t.id !== id);
        guardarYRenderizar();
    };

    // 7. ACTUALIZAR PROGRESO
    window.actualizarProgreso = function(id, valor) {
        tareas = tareas.map(t => t.id === id ? {...t, progreso: parseInt(valor)} : t);
        actualizarEstadisticas();
        localStorage.setItem('mis-tareas-v4', JSON.stringify(tareas));
    };

    // 8. RENDERIZADO
    function renderizarTareas() {
        if(contenedorActivas) contenedorActivas.innerHTML = '';
        if(contenedorArchivo) contenedorArchivo.innerHTML = '';

        let tareasAMostrar = [...tareas];

        // Filtro
        const filtro = filterPriority ? filterPriority.value : 'all';
        if (filtro !== 'all') {
            tareasAMostrar = tareasAMostrar.filter(t => t.priority === filtro);
        }

        // Ordenación
        const orden = sortTasks ? sortTasks.value : 'date';
        const priorityOrder = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
        tareasAMostrar.sort((a, b) => {
            if (orden === 'alpha') return a.title.localeCompare(b.title);
            if (orden === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
            return b.id - a.id; 
        });

        // Dibujar
        tareasAMostrar.forEach(tarea => {
            const html = crearTarjetaHTML(tarea);
            if (tarea.estado === 'proceso') {
                contenedorActivas.appendChild(html);
            } else {
                contenedorArchivo.appendChild(html);
            }
        });

        actualizarEstadisticas();
    }

    function crearTarjetaHTML(tarea) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.setAttribute('data-priority', tarea.priority);
        
        let controlProgreso = tarea.estado === 'proceso' ? `
            <div style="margin-top:10px">
                <input type="range" min="0" max="100" value="${tarea.progreso}" 
                 oninput="actualizarProgreso(${tarea.id}, this.value)">
                <span style="font-size: 0.8em">${tarea.progreso}%</span>
            </div>` : '';

        let btnTexto = tarea.estado === 'pendiente' ? 'Empezar' : (tarea.estado === 'proceso' ? 'Finalizar' : 'Reiniciar');
        let btnIcono = tarea.estado === 'pendiente' ? 'fa-play' : (tarea.estado === 'proceso' ? 'fa-check' : 'fa-redo');

        card.innerHTML = `
            <h3 style="${tarea.estado === 'completada' ? 'text-decoration: line-through; opacity: 0.6' : ''}">${tarea.title}</h3>
            <span class="badge badge-${tarea.priority}">${tarea.priority}</span>
            <div class="progress-container"><div class="progress-bar" style="width: ${tarea.progreso}%"></div></div>
            ${controlProgreso}
            <div style="margin-top:15px">
                <button onclick="cambiarEstado(${tarea.id})"><i class="fas ${btnIcono}"></i> ${btnTexto}</button>
                <button style="background:#ff4757; margin-left:10px" onclick="eliminarTarea(${tarea.id})"><i class="fas fa-trash"></i></button>
            </div>`;
        return card;
    }

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

    function guardarYRenderizar() {
        localStorage.setItem('mis-tareas-v4', JSON.stringify(tareas));
        renderizarTareas();
    }

    // Escuchadores de filtros
    if(filterPriority) filterPriority.addEventListener('change', renderizarTareas);
    if(sortTasks) sortTasks.addEventListener('change', renderizarTareas);

    // Inicio inicial
    renderizarTareas();
});