# 🚀 TaskFlow Pro - Mi Primera API Full Stack

¡Hola! Este es mi proyecto de gestión de tareas. Empezó siendo una web sencilla con LocalStorage, pero lo he evolucionado a una aplicación **Full Stack** real con Node.js y Express. 

Me ha costado un poco entender cómo separar todo, pero he intentado seguir a rajatabla lo que pidió el profe sobre "ingeniería de software".

## 🏗️ La Arquitectura (Separación de Preocupaciones)

Para que el código no fuera un lío, lo he dividido en capas. Así, si algo falla, sé exactamente dónde mirar:

* **Routes:** El "recepcionista". Solo se encarga de recibir las peticiones de internet y pasarlas al controlador.
* **Controllers:** El "jefe de planta". Revisa que los datos que vienen del formulario estén bien (validación en la frontera de red) y decide qué responder.
* **Services:** El "cerebro". Aquí es donde está la lógica de verdad, como añadir tareas al array o borrarlas. No sabe nada de Express, solo de datos.
* **Config:** Aquí guardo el puerto y las cosas del `.env`. He puesto un "blindaje" para que el servidor no arranque si falta el puerto (metodología 12-Factor App).

## 🛠️ Tecnologías que he usado

* **Backend:** Node.js y Express.
* **Frontend:** HTML, CSS y JavaScript (consumiendo la API con `fetch`).
* **Seguridad:** Middlewares para errores globales y validaciones para que no me metan datos vacíos.
* **Herramientas de desarrollo:** Nodemon (para no volverme loca reiniciando) y Dotenv para las variables de entorno.

## 🚀 Cómo ponerlo en marcha

Si quieres probarlo en tu PC, sigue estos pasos:

1.  Clona el repo.
2.  Instala las dependencias: `npm install`
3.  Crea un archivo `.env` en la raíz y ponle: `PORT=3000`
4.  Arranca el servidor en modo desarrollo: `npm run dev`
5.  Abre el `index.html` con Live Server y listo.

## 🧠 Lo que he aprendido (y mis dudas)

* He aprendido que el **Event Loop** es lo que hace que Node sea rápido, aunque todavía me raya un poco pensar en cómo gestiona tantas cosas a la vez con un solo hilo.
* Ya entiendo la diferencia entre **POST, GET, PUT y DELETE** (la semántica HTTP). He usado el código **201** para crear y el **204** para borrar porque es lo más profesional.
* Lo más difícil ha sido pasar del LocalStorage a las funciones `async/await` con `fetch`, pero mola mucho ver cómo los datos ahora viajan de verdad al servidor.
