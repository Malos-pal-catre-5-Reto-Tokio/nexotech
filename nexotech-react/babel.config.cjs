// Babel solo lo usa Karma (vía babel-loader). Vite compila el JSX por su cuenta.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { chrome: '100' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  env: {
    // En las pruebas se instrumenta el código para calcular la cobertura
    test: {
      plugins: ['istanbul'],
    },
  },
};
