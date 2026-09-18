
const REGEX_CORREO = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
const REGEX_RUN = /^[0-9]{6,8}[0-9kK]$/;

function mostrarError(inputEl, esValido) {
  const grupo = inputEl.closest('.form-group');
  if (!grupo) return;
  grupo.classList.toggle('invalid', !esValido);
}

function validarCorreo(inputEl) {
  const valor = inputEl.value.trim();
  const esValido = valor.length > 0 && valor.length <= 100 && REGEX_CORREO.test(valor);
  mostrarError(inputEl, esValido);
  return esValido;
}

function validarContrasena(inputEl) {
  const valor = inputEl.value;
  const esValido = valor.length >= 4 && valor.length <= 10;
  mostrarError(inputEl, esValido);
  return esValido;
}

function validarRequerido(inputEl, maxLength) {
  const valor = inputEl.value.trim();
  const esValido = valor.length > 0 && (!maxLength || valor.length <= maxLength);
  mostrarError(inputEl, esValido);
  return esValido;
}

function validarRun(inputEl) {
  const valor = inputEl.value.trim();
  const esValido = valor.length >= 7 && valor.length <= 9 && REGEX_RUN.test(valor);
  mostrarError(inputEl, esValido);
  return esValido;
}

function validarConfirmacion(inputEl, inputOriginalEl) {
  const esValido = inputEl.value === inputOriginalEl.value && inputEl.value.trim() !== '';
  mostrarError(inputEl, esValido);
  return esValido;
}

// ===== LOGIN =====
const loginForm = document.getElementById('login-form');

if (loginForm) {
  const correoInput = document.getElementById('correo');
  const contrasenaInput = document.getElementById('contrasena');

  correoInput.addEventListener('blur', () => validarCorreo(correoInput));
  contrasenaInput.addEventListener('blur', () => validarContrasena(contrasenaInput));

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const correoOk = validarCorreo(correoInput);
    const contrasenaOk = validarContrasena(contrasenaInput);

    if (correoOk && contrasenaOk) {
      alert('Inicio de sesión simulado correctamente.');
      loginForm.reset();
    }
  });
}

// ===== REGISTRO =====
const registroForm = document.getElementById('registro-form');

if (registroForm) {
  const runInput = document.getElementById('run');
  const nombreInput = document.getElementById('nombre');
  const apellidosInput = document.getElementById('apellidos');
  const correoInput = document.getElementById('correo');
  const confirmarCorreoInput = document.getElementById('confirmar-correo');
  const contrasenaInput = document.getElementById('contrasena');
  const confirmarContrasenaInput = document.getElementById('confirmar-contrasena');
  const regionInput = document.getElementById('region');
  const comunaInput = document.getElementById('comuna');
  const direccionInput = document.getElementById('direccion');

  runInput.addEventListener('blur', () => validarRun(runInput));
  nombreInput.addEventListener('blur', () => validarRequerido(nombreInput, 50));
  apellidosInput.addEventListener('blur', () => validarRequerido(apellidosInput, 100));
  correoInput.addEventListener('blur', () => validarCorreo(correoInput));
  confirmarCorreoInput.addEventListener('blur', () => validarConfirmacion(confirmarCorreoInput, correoInput));
  contrasenaInput.addEventListener('blur', () => validarContrasena(contrasenaInput));
  confirmarContrasenaInput.addEventListener('blur', () => validarConfirmacion(confirmarContrasenaInput, contrasenaInput));
  direccionInput.addEventListener('blur', () => validarRequerido(direccionInput, 300));

  registroForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const resultados = [
      validarRun(runInput),
      validarRequerido(nombreInput, 50),
      validarRequerido(apellidosInput, 100),
      validarCorreo(correoInput),
      validarConfirmacion(confirmarCorreoInput, correoInput),
      validarContrasena(contrasenaInput),
      validarConfirmacion(confirmarContrasenaInput, contrasenaInput),
      validarRequerido(direccionInput, 300),
      validarRequerido(regionInput),
      validarRequerido(comunaInput),
    ];

    const formularioValido = resultados.every(Boolean);

    if (formularioValido) {
      alert('Registro exitoso.');
      registroForm.reset();
    }
  });
}