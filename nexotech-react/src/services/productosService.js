import { peticion } from './api.js';

// filtros opcionales: { categoria: 'notebooks', oferta: true, critico: true, q: 'mouse' }
export function listarProductos(filtros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '' && valor !== false) {
      params.set(clave, valor === true ? '1' : valor);
    }
  });
  const consulta = params.toString();
  return peticion(`productos.php${consulta ? `?${consulta}` : ''}`);
}

export const obtenerProducto = (id) => peticion(`productos.php?id=${id}`);
export const crearProducto = (datos) => peticion('productos.php', { metodo: 'POST', cuerpo: datos });
export const actualizarProducto = (id, datos) =>
  peticion(`productos.php?id=${id}`, { metodo: 'PUT', cuerpo: datos });
export const eliminarProducto = (id) => peticion(`productos.php?id=${id}`, { metodo: 'DELETE' });
