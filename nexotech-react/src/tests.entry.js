// Punto de entrada de las pruebas: carga automáticamente todos los *.spec.js(x) de src/
const contexto = require.context('./', true, /\.spec\.jsx?$/);
contexto.keys().forEach(contexto);
