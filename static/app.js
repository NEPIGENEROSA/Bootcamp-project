// ─── Estado local (caché mientras usas la app) ───────────────
let tareas = [];

// ─── Modo oscuro ──────────────────────────────────────────────
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dark-mode', isDark);
    const btn = document.querySelector('.btn-mode');
    if (btn) btn.textContent = isDark ? '☀️ Modo Claro' : '🌓 Cambiar Modo';
}

// ─── Helpers API ──────────────────────────────────────────────
async function apiFetch(url, opciones = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...opciones
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
}

// ─── Mostrar/ocultar spinner de carga ─────────────────────────
function setCargando(activo) {
    const spinner = document.getElementById('spinner-carga');
    if (spinner) spinner.style.display = activo ? 'block' : 'none';
}

// ─── Al cargar la página ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    console.log('¡JS cargado!');

    // Modo oscuro guardado localmente (no necesita BD)
    if (localStorage.getItem('dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        const btn = document.querySelector('.btn-mode');
        if (btn) btn.textContent = '☀️ Modo Claro';
    }

    // Cargar tareas desde MongoDB
    await cargarTareas();

    // Formulario: añadir tarea
    const formulario = document.getElementById('formulario-tarea');
    if (!formulario) { console.error('❌ Formulario no encontrado'); return; }

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputTarea     = document.getElementById('input-tarea');
        const inputPrioridad = document.getElementById('input-prioridad');
        const texto = inputTarea.value.trim();
        if (!texto) return;

        const btnSubmit = formulario.querySelector('button[type="submit"]');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Guardando...';

        try {
            const nueva = await apiFetch('/api/tareas', {
                method: 'POST',
                body: JSON.stringify({ title: texto, priority: inputPrioridad.value })
            });
            tareas.unshift(nueva);
            inputTarea.value = '';
            renderizarTareas();
        } catch (err) {
            alert('❌ No se pudo guardar la tarea. Revisa la conexión.');
            console.error(err);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Añadir Tarea';
        }
    });

    // Filtros y orden
    const filterPriority = document.getElementById('filter-priority');
    const sortTasks      = document.getElementById('sort-tasks');
    if (filterPriority) filterPriority.addEventListener('change', renderizarTareas);
    if (sortTasks)      sortTasks.addEventListener('change', renderizarTareas);
});

// ─── Cargar tareas desde la API ───────────────────────────────
async function cargarTareas() {
    setCargando(true);
    try {
        tareas = await apiFetch('/api/tareas');
        renderizarTareas();
    } catch (err) {
        console.error('Error cargando tareas:', err);
        document.getElementById('lista-tareas-activas').innerHTML =
            '<p style="color:red;padding:10px">⚠️ No se pudieron cargar las tareas.</p>';
    } finally {
        setCargando(false);
    }
}

// ─── Cambiar estado (Pendiente → Proceso → Completada → ...) ──
window.cambiarEstado = async function(id) {
    const tarea = tareas.find(t => t._id === id);
    if (!tarea) return;

    let nuevoEstado, nuevoProgreso;
    if      (tarea.estado === 'pendiente')  { nuevoEstado = 'proceso';    nuevoProgreso = 20; }
    else if (tarea.estado === 'proceso')    { nuevoEstado = 'completada'; nuevoProgreso = 100; }
    else                                    { nuevoEstado = 'pendiente';  nuevoProgreso = 0; }

    // Actualizar local inmediatamente (UI rápida)
    tarea.estado   = nuevoEstado;
    tarea.progreso = nuevoProgreso;
    renderizarTareas();

    // Guardar en BD
    try {
        await apiFetch(`/api/tareas/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: nuevoEstado, progreso: nuevoProgreso })
        });
    } catch (err) {
        console.error('Error actualizando estado:', err);
    }
};

// ─── Eliminar tarea ───────────────────────────────────────────
window.eliminarTarea = async function(id) {
    if (!confirm('¿Borrar tarea?')) return;

    tareas = tareas.filter(t => t._id !== id);
    renderizarTareas();

    try {
        await apiFetch(`/api/tareas/${id}`, { method: 'DELETE' });
    } catch (err) {
        console.error('Error borrando tarea:', err);
    }
};

// ─── Actualizar progreso (slider) ────────────────────────────
window.actualizarProgreso = async function(id, valor) {
    const tarea = tareas.find(t => t._id === id);
    if (!tarea) return;

    tarea.progreso = parseInt(valor);
    actualizarEstadisticas();

    // Guardar en BD (con debounce para no spamear)
    clearTimeout(window._progresoTimer);
    window._progresoTimer = setTimeout(async () => {
        try {
            await apiFetch(`/api/tareas/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ progreso: tarea.progreso })
            });
        } catch (err) {
            console.error('Error actualizando progreso:', err);
        }
    }, 500);
};

// ─── Renderizar todas las tareas ──────────────────────────────
function renderizarTareas() {
    const contActivas = document.getElementById('lista-tareas-activas');
    const contArchivo = document.getElementById('lista-archivo');
    if (!contActivas || !contArchivo) return;

    // Filtrar
    const filtroPrioridad = document.getElementById('filter-priority')?.value || 'all';
    const criterioOrden   = document.getElementById('sort-tasks')?.value || 'date';

    let filtradas = filtroPrioridad === 'all'
        ? [...tareas]
        : tareas.filter(t => t.priority === filtroPrioridad);

    // Ordenar
    const orden = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
    if (criterioOrden === 'alpha') {
        filtradas.sort((a, b) => a.title.localeCompare(b.title));
    } else if (criterioOrden === 'priority') {
        filtradas.sort((a, b) => (orden[a.priority] || 9) - (orden[b.priority] || 9));
    }

    contActivas.innerHTML = '';
    contArchivo.innerHTML = '';

    const activas = filtradas.filter(t => t.estado === 'proceso');
    const archivo = filtradas.filter(t => t.estado !== 'proceso');

    if (activas.length === 0) {
        contActivas.innerHTML = '<p style="opacity:0.5;padding:10px">No hay tareas en curso.</p>';
    } else {
        activas.forEach(t => contActivas.appendChild(crearCard(t)));
    }

    if (archivo.length === 0) {
        contArchivo.innerHTML = '<p style="opacity:0.5;padding:10px">No hay tareas aquí todavía.</p>';
    } else {
        archivo.forEach(t => contArchivo.appendChild(crearCard(t)));
    }

    actualizarEstadisticas();
}

// ─── Crear tarjeta HTML de una tarea ─────────────────────────
function crearCard(tarea) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('data-priority', tarea.priority);

    const controlProgreso = tarea.estado === 'proceso' ? `
        <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
            <input type="range" min="0" max="100" value="${tarea.progreso}" style="flex:1"
             oninput="actualizarProgreso('${tarea._id}', this.value); this.nextElementSibling.textContent = this.value + '%'">
            <span style="min-width:36px;font-size:0.85em">${tarea.progreso}%</span>
        </div>` : '';

    const btnTexto = tarea.estado === 'pendiente' ? 'Empezar'
                   : tarea.estado === 'proceso'   ? 'Finalizar'
                   : 'Reiniciar';

    card.innerHTML = `
        <h3 style="${tarea.estado === 'completada' ? 'text-decoration:line-through;opacity:0.6' : ''}">${tarea.title}</h3>
        <span class="badge badge-${tarea.priority}">${tarea.priority}</span>
        <div class="progress-container">
            <div class="progress-bar" style="width:${tarea.progreso}%"></div>
        </div>
        ${controlProgreso}
        <div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap">
            <button onclick="cambiarEstado('${tarea._id}')">${btnTexto}</button>
            <button style="background:#ff4757" onclick="eliminarTarea('${tarea._id}')">Eliminar</button>
        </div>`;

    return card;
}

// ─── Estadísticas ─────────────────────────────────────────────
function actualizarEstadisticas() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    set('total-tareas',       tareas.length);
    set('completadas-tareas', tareas.filter(t => t.estado === 'completada').length);
    set('en-proceso-tareas',  tareas.filter(t => t.estado === 'proceso').length);
    set('pendientes-tareas',  tareas.filter(t => t.estado === 'pendiente').length);
}
