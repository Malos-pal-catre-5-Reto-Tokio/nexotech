import { peticion } from './api.js';

// Gestión de usuarios: solo el administrador puede usar estas funciones.
export const listarUsuarios = () => peticion('usuarios.php');
export const obtenerUsuario = (id) => peticion(`usuarios.php?id=${id}`);
export const crearUsuario = (datos) => peticion('usuarios.php', { metodo: 'POST', cuerpo: datos });
export const actualizarUsuario = (id, datos) =>
  peticion(`usuarios.php?id=${id}`, { metodo: 'PUT', cuerpo: datos });
export const eliminarUsuario = (id) => peticion(`usuarios.php?id=${id}`, { metodo: 'DELETE' });
