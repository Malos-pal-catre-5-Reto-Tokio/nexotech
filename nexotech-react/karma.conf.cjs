// Configuración de Karma + Jasmine para las pruebas unitarias de React.
// Se usa .cjs porque package.json declara "type": "module".

// Activa babel-plugin-istanbul (ver babel.config.cjs) para medir cobertura.
process.env.BABEL_ENV = 'test';

module.exports = function (config) {
  config.set({ port: 9880,
    basePath: '',

    frameworks: ['jasmine', 'webpack'],

    plugins: [
      'karma-jasmine',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-spec-reporter',
      'karma-coverage',
    ],

    // Un único punto de entrada que carga todos los archivos *.spec.jsx
    files: [{ pattern: 'src/tests.entry.cjs', watched: false }],

    preprocessors: {
      'src/tests.entry.cjs': ['webpack'],
    },

    // webpack compila el JSX de los componentes y de las pruebas
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['.js', '.jsx'],
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: 'babel-loader',
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
        ],
      },
    },

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'lcov', subdir: 'lcov' },
      ],
    },

    // Chrome sin ventana. Si Chrome no está en la ruta por defecto,
    // define la variable de entorno CHROME_BIN con la ruta del ejecutable.
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },

    singleRun: false,
    autoWatch: true,
  });
};
