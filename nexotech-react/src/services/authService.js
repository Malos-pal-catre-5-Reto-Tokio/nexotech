import { peticion } from './api.js';

// La sesión vive en una cookie que maneja PHP (HttpOnly): React no guarda contraseñas ni tokens.
export const obtenerSesion = () => peticion('auth.php');
export const iniciarSesion = (correo, password) =>
  peticion('auth.php?accion=login', { metodo: 'POST', cuerpo: { correo, password } });
export const registrarUsuario = (datos) =>
  peticion('auth.php?accion=registro', { metodo: 'POST', cuerpo: datos });
export const cerrarSesion = () => peticion('auth.php?accion=logout', { metodo: 'POST', cuerpo: {} });
export const actualizarPerfil = (datos) =>
  peticion('auth.php?accion=perfil', { metodo: 'POST', cuerpo: datos });
