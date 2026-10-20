// Funciones puras de precios: fáciles de probar y reutilizables en toda la tienda.

// Precio unitario con el descuento de oferta aplicado (descuento en %, 0 = sin oferta).
export function precioFinal(producto) {
  const descuento = Number(producto.descuento) || 0;
  return Math.round(producto.precio * (1 - descuento / 100));
}

export function formatearPrecio(valor) {
  return valor.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
}
