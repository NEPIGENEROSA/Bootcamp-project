## BOOTCAMP PROJECT

## Introducción
TaskFlow Pro es una solución digital diseñada para optimizar la gestión del tiempo y la organización de tareas diarias. En un entorno saturado de distracciones, esta herramienta nace con el objetivo de ofrecer una interfaz limpia, intuitiva y eficiente que permita al usuario centrarse en lo verdaderamente importante: completar sus metas.

## Descripción del Proyecto
El proyecto consiste en una aplicación web de lista de tareas (To-Do List) avanzada. A diferencia de una lista convencional, TaskFlow Pro integra una jerarquía de prioridades y un sistema de visualización inteligente que permite separar las tareas en curso de las archivadas. El diseño se ha centrado en la usabilidad (UX), implementando un tablero de control lateral (sidebar) para estadísticas y filtros, dejando el área central para la acción y creación.

## Enumeración de Funcionalidades
  ## Gestión Dinámica:
  Creación y eliminación de tareas en tiempo real sin recargas innecesarias.

  ## Categorización por Prioridad: 
  Asignación de etiquetas (Alta 🔥, Media ⚡, Baja ✅) para identificar urgencias.

  ## Filtros Inteligentes: 
  Capacidad de visualizar únicamente tareas de una prioridad específica.

  ## Ordenación Multicriterio: 
  Opción de organizar la lista por orden alfabético, por fecha de creación o por nivel de importancia.

  ## Panel de Estadísticas: 
  Resumen automático que contabiliza tareas totales, pendientes, en curso y completadas.

  ## Sistema de Archivo: 
  Espacio dedicado para ocultar tareas finalizadas y mantener el foco en las actuales.

  ## Modo Oscuro Integrado: 
  Cambio de tema visual para adaptarse a las preferencias de iluminación del usuario.
  
## 🛠️ Hecho con:
  ## Backend: 
  -- Python / Flask: El motor del lado del servidor que gestiona las rutas y la lógica de negocio. Actualmente, se encuentra          preparado   para la persistencia de datos y futuras expansiones de API.

  ## Frontend: EJE PRINCIPAL, LA CARA DE LA APLICACIÓN
  -- HTML5: Para la construcción de una estructura semántica y accesible.

  --  CSS3 (Flexbox & Grid): Implementación de un diseño responsive de dos columnas y cuadrículas para las tarjetas de tareas.

  -- JavaScript (Vanilla): Motor de la lógica del cliente, encargado de la manipulación del DOM, el filtrado dinámico y la gestión    de  estados.

  -- FontAwesome: Biblioteca de iconos para mejorar la comunicación visual.

  -- Iconos: Font Awesome.
## Herramientas de Apoyo
  -- IA (Cursor/Gemini): Utilizada como colaborador técnico para la refactorización de código y optimización de componentes CSS.
  Manual de usuario.
  
## Cómo ejecutar en local
-- Descarga: Clona el repositorio desde GitHub usando git clone [URL-del-repositorio].

-- Instalación: Asegúrate de tener Python instalado. Instala Flask ejecutando pip install flask en tu terminal.

-- Ejecución: Navega hasta la carpeta del proyecto y ejecuta el comando python app.py.

-- Acceso: Abre tu navegador y escribe http://127.0.0.1:5000.

## Cómo desplegar en Vercel
-- Sube tu código a un repositorio de GitHub.

-- Inicia sesión en Vercel y selecciona "Add New Project".

-- Importa tu repositorio. Vercel detectará automáticamente la configuración de Flask.

-- Haz clic en "Deploy" y tu aplicación estará en línea en cuestión de segundos.


Antes de darle total forma a este proyecto hice un croquis sobre como queria que me quedara, y aqui esta la imagen.
Amedida que iba avanzando en el proyecto fueron surguendo nuevas ideas por lo que este croquis no coincidira del todo.
<img width="1016" height="983" alt="Captura de pantalla 2026-04-07 234227" src="https://github.com/user-attachments/assets/e7319e0c-c49a-42da-8984-99bacd68c9ce" />

-- He documentado la prueba y todo el proceso de creación de la app en un google doc,
voy a compartir el enlace aquí para acceder al documento y en él está el enlace para ver el video de la prueba inicial de la app.
https://docs.google.com/document/d/1qspbMUYor2U-aBTBGk0wHWbk_HgeATbRne8cs6Czprs/edit?usp=sharing 
Ahí está el enlace.
Además dejo aqui una imagen del resultado final de mi app.
<img width="1910" height="1078" alt="Captura de pantalla 2026-04-18 132646" src="https://github.com/user-attachments/assets/3158ec78-e28f-471a-ad96-d2f4bfc2aab8" />

## Subiré ademas en este Readme mi enlace de vercel. Aunque ya esta arriba.

(https://vercel.com/kerima/v0-v0-nepigenerosa-adefa1ee)







{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "templates/*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/",
      "dest": "templates/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "templates/$1"
    }
  ]
}