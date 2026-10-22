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

// ---- Contacto ----
export function validarContacto({ nombre = '', correo = '', comentario = '' }) {
  const errores = {};
  if (!nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
  else if (nombre.trim().length > 100) errores.nombre = 'Máximo 100 caracteres.';

  if (!correo.trim()) errores.correo = 'El correo es obligatorio.';
  else if (!esCorreoPermitido(correo.trim())) errores.correo = 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.';

  if (!comentario.trim()) errores.comentario = 'El comentario es obligatorio.';
  else if (comentario.trim().length > 500) errores.comentario = 'Máximo 500 caracteres.';
  return errores;
}

// ---- Panel de administración ----
const esEntero = (valor) => /^\d+$/.test(String(valor ?? '').trim());

export function validarProducto(datos) {
  const errores = {};
  const limpio = (campo) => String(datos[campo] ?? '').trim();

  if (!limpio('codigo')) errores.codigo = 'El código es obligatorio.';
  else if (limpio('codigo').length > 20) errores.codigo = 'Máximo 20 caracteres.';

  if (!limpio('nombre')) errores.nombre = 'El nombre es obligatorio.';
  else if (limpio('nombre').length > 100) errores.nombre = 'Máximo 100 caracteres.';

  if (limpio('descripcion').length > 1000) errores.descripcion = 'Máximo 1000 caracteres.';
  if (limpio('imagen').length > 255) errores.imagen = 'Máximo 255 caracteres.';

  const mensajeEntero = 'Debe ser un número entero mayor o igual a 0.';
  if (!esEntero(datos.precio)) errores.precio = mensajeEntero;
  if (!esEntero(datos.stock)) errores.stock = mensajeEntero;
  if (!esEntero(datos.stockCritico)) errores.stockCritico = mensajeEntero;

  if (!esEntero(datos.descuento) || Number(datos.descuento) > 90) errores.descuento = 'Debe ser un entero entre 0 y 90.';
  if (!datos.categoriaId) errores.categoriaId = 'Selecciona una categoría.';
  return errores;
}

export function validarCategoria(datos) {
  const errores = {};
  if (!/^[a-z0-9-]{2,40}$/.test(String(datos.slug ?? '').trim())) {
    errores.slug = 'Entre 2 y 40 caracteres: minúsculas, números o guiones.';
  }
  if (!String(datos.nombre ?? '').trim()) errores.nombre = 'El nombre es obligatorio.';
  else if (String(datos.nombre).trim().length > 60) errores.nombre = 'Máximo 60 caracteres.';
  return errores;
}

// Usuario creado o editado por el administrador. Al editar, la contraseña es opcional.
export function validarUsuarioAdmin(datos, { creando }) {
  const errores = {};
  const limpio = (campo) => String(datos[campo] ?? '').trim();

  if (!REGEX_RUN.test(limpio('run'))) errores.run = 'RUN inválido: sin puntos ni guion (ej: 19011022K).';
  if (!limpio('nombre')) errores.nombre = 'El nombre es obligatorio.';
  else if (limpio('nombre').length > 50) errores.nombre = 'Máximo 50 caracteres.';
  if (!limpio('apellidos')) errores.apellidos = 'Los apellidos son obligatorios.';
  else if (limpio('apellidos').length > 100) errores.apellidos = 'Máximo 100 caracteres.';

  if (!limpio('correo')) errores.correo = 'El correo es obligatorio.';
  else if (!esCorreoPermitido(limpio('correo'))) errores.correo = 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.';

  if (!['admin', 'vendedor', 'cliente'].includes(datos.rol)) errores.rol = 'Selecciona un rol.';

  const password = datos.password ?? '';
  if ((creando || password) && (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX)) {
    errores.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
  }

  if (!datos.region) errores.region = 'Selecciona una región.';
  if (!datos.comuna) errores.comuna = 'Selecciona una comuna.';
  if (!limpio('direccion')) errores.direccion = 'La dirección es obligatoria.';
  else if (limpio('direccion').length > 150) errores.direccion = 'Máximo 150 caracteres.';
  return errores;
}

// Perfil propio: datos personales y, opcionalmente, cambio de contraseña.
export function validarPerfil(datos) {
  const errores = {};
  const limpio = (campo) => String(datos[campo] ?? '').trim();

  if (!limpio('nombre')) errores.nombre = 'El nombre es obligatorio.';
  else if (limpio('nombre').length > 50) errores.nombre = 'Máximo 50 caracteres.';
  if (!limpio('apellidos')) errores.apellidos = 'Los apellidos son obligatorios.';
  else if (limpio('apellidos').length > 100) errores.apellidos = 'Máximo 100 caracteres.';
  if (!datos.region) errores.region = 'Selecciona una región.';
  if (!datos.comuna) errores.comuna = 'Selecciona una comuna.';
  if (!limpio('direccion')) errores.direccion = 'La dirección es obligatoria.';

  const nueva = datos.passwordNueva ?? '';
  if (nueva) {
    if (nueva.length < PASSWORD_MIN || nueva.length > PASSWORD_MAX) {
      errores.passwordNueva = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
    }
    if (!datos.passwordActual) errores.passwordActual = 'Ingresa tu contraseña actual para cambiarla.';
    if ((datos.confirmarPassword ?? '') !== nueva) errores.confirmarPassword = 'Las contraseñas no coinciden.';
  }
  return errores;
}
