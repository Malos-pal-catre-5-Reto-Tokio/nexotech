import { peticion } from './api.js';

// pago: 'aprobado' | 'rechazado' (simula la respuesta de la pasarela de pago)
export const crearOrden = (orden) => peticion('ordenes.php', { metodo: 'POST', cuerpo: orden });
export const obtenerOrden = (id) => peticion(`ordenes.php?id=${id}`);
export const reintentarPago = (id) =>
  peticion(`ordenes.php?id=${id}`, { metodo: 'PUT', cuerpo: { pago: 'aprobado' } });
export const listarOrdenes = () => peticion('ordenes.php');
