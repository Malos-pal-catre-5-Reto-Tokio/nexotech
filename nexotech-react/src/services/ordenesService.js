import { peticion } from './api.js';

// pago: 'aprobado' | 'rechazado' (simula la respuesta de la pasarela de pago)
export const crearOrden = (orden) => peticion('ordenes.php', { metodo: 'POST', cuerpo: orden });
export const obtenerOrden = (id) => peticion(`ordenes.php?id=${id}`);
export const reintentarPago = (id) =>
  peticion(`ordenes.php?id=${id}`, { metodo: 'PUT', cuerpo: { pago: 'aprobado' } });
// filtros opcionales: { usuario: 3 } para ver el historial de compras de un usuario (solo personal).
export const listarOrdenes = (filtros = {}) => {
  const consulta = new URLSearchParams(filtros).toString();
  return peticion(`ordenes.php${consulta ? `?${consulta}` : ''}`);
};
