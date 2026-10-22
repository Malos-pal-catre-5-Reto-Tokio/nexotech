import { peticion } from './api.js';

export const enviarMensaje = (mensaje) => peticion('contacto.php', { metodo: 'POST', cuerpo: mensaje });
export const listarMensajes = () => peticion('contacto.php'); // solo admin y vendedor
