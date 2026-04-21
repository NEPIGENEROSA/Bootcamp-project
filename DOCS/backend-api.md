He estado investigando las herramientas que se usan en las empresas para las APIs y, aunque algunas se parecen entre sí, esto es lo que he entendido por ahora:

1. Axios
Es como el fetch que usamos en JavaScript para llamar al servidor, pero "tuneado". Por lo visto, te ahorra líneas de código porque ya sabe que lo que le llega es un JSON y no tienes que estar convirtiéndolo tú a mano. Me parece más cómodo que el fetch nativo, la verdad.

2. Postman (o Thunder Client)
Esta me ha salvado la vida. Es una aplicación para probar si tus rutas (los GET, POST...) funcionan sin tener que estar dándole a los botones de la web. Le mandas un JSON de prueba y ves si el servidor te devuelve el 201 o te lanza un error. Si no fuera por esto, me volvería loca depurando el código.

3. Sentry
Esto es como un "chivato". Si el servidor peta cuando ya está subido a internet (en producción), Sentry te manda un aviso diciendo exactamente en qué línea de código ha fallado. Así no tienes que esperar a que un usuario se queje para saber que algo va mal.

4. Swagger
Es para no tener que explicarle a mano a otros programadores qué hace tu API. Te crea una página web automática donde salen todas tus rutas y lo que hace cada una. Es como el manual de instrucciones de la API pero se hace casi solo.