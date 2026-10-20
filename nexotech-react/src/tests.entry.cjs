// Punto de entrada de las pruebas (.cjs porque package.json declara "type": "module" y require.context necesita CommonJS).
// Carga automáticamente todos los *.spec.js(x) de src/
const contexto = require.context('./', true, /\.spec\.jsx?$/);
contexto.keys().forEach(contexto);
