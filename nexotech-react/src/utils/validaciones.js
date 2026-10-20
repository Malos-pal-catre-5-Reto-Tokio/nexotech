// Validaciones del formulario de compra (funciones puras, migradas de validaciones-tienda.js).
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esCorreoValido(correo) {
  return correo.length <= 100 && REGEX_CORREO.test(correo);
}

// Devuelve un objeto { campo: 'mensaje' }. Si está vacío, el formulario es válido.
export function validarCheckout(datos) {
  const errores = {};
  const limpio = (campo) => (datos[campo] ?? '').trim();

  if (!limpio('nombre')) errores.nombre = 'El nombre es obligatorio.';
  else if (limpio('nombre').length > 50) errores.nombre = 'Máximo 50 caracteres.';

  if (!limpio('apellidos')) errores.apellidos = 'Los apellidos son obligatorios.';
  else if (limpio('apellidos').length > 100) errores.apellidos = 'Máximo 100 caracteres.';

  if (!limpio('correo')) errores.correo = 'El correo es obligatorio.';
  else if (!esCorreoValido(limpio('correo'))) errores.correo = 'Ingresa un correo válido.';

  if (!limpio('calle')) errores.calle = 'La calle es obligatoria.';
  else if (limpio('calle').length > 150) errores.calle = 'Máximo 150 caracteres.';

  if (limpio('departamento').length > 30) errores.departamento = 'Máximo 30 caracteres.';
  if (!datos.region) errores.region = 'Selecciona una región.';
  if (!datos.comuna) errores.comuna = 'Selecciona una comuna.';
  if (limpio('indicaciones').length > 300) errores.indicaciones = 'Máximo 300 caracteres.';

  return errores;
}

// ---- Login y registro (reglas de la Evaluación Parcial 1) ----
const REGEX_CORREO_PERMITIDO = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
const REGEX_RUN = /^[0-9]{6,8}[0-9kK]$/;
export const PASSWORD_MIN = 4;
export const PASSWORD_MAX = 10;

// Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.
export function esCorreoPermitido(correo) {
  return correo.length <= 100 && REGEX_CORREO_PERMITIDO.test(correo);
}

export function validarLogin({ correo = '', password = '' }) {
  const errores = {};
  if (!correo.trim()) errores.correo = 'El correo es obligatorio.';
  else if (!esCorreoPermitido(correo.trim())) errores.correo = 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.';
  if (!password) errores.password = 'La contraseña es obligatoria.';
  return errores;
}

export function validarRegistro(datos) {
  const errores = {};
  const limpio = (campo) => (datos[campo] ?? '').trim();

  if (!REGEX_RUN.test(limpio('run'))) errores.run = 'RUN inválido: sin puntos ni guion (ej: 19011022K).';

  if (!limpio('nombre')) errores.nombre = 'El nombre es obligatorio.';
  else if (limpio('nombre').length > 50) errores.nombre = 'Máximo 50 caracteres.';

  if (!limpio('apellidos')) errores.apellidos = 'Los apellidos son obligatorios.';
  else if (limpio('apellidos').length > 100) errores.apellidos = 'Máximo 100 caracteres.';

  if (!limpio('correo')) errores.correo = 'El correo es obligatorio.';
  else if (!esCorreoPermitido(limpio('correo'))) errores.correo = 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.';

  if (limpio('confirmarCorreo').toLowerCase() !== limpio('correo').toLowerCase()) {
    errores.confirmarCorreo = 'Los correos no coinciden.';
  }

  const password = datos.password ?? '';
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    errores.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
  }
  if ((datos.confirmarPassword ?? '') !== password) errores.confirmarPassword = 'Las contraseñas no coinciden.';

  if (!datos.region) errores.region = 'Selecciona una región.';
  if (!datos.comuna) errores.comuna = 'Selecciona una comuna.';

  if (!limpio('direccion')) errores.direccion = 'La dirección es obligatoria.';
  else if (limpio('direccion').length > 150) errores.direccion = 'Máximo 150 caracteres.';

  return errores;
}
