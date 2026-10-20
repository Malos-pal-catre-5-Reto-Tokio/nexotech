import { useState } from 'react';
import { useCarrito } from '../context/CarritoContext.jsx';

// Agrega al carrito y guarda el aviso (éxito o error de stock) para mostrarlo en pantalla.
export function useAgregarAlCarrito() {
  const { agregar } = useCarrito();
  const [aviso, setAviso] = useState(null);

  const agregarProducto = (producto, cantidad = 1) => {
    const resultado = agregar(producto, cantidad);
    setAviso({ tipo: resultado.ok ? 'success' : 'danger', texto: resultado.mensaje });
    return resultado;
  };

  return { aviso, agregarProducto, cerrarAviso: () => setAviso(null) };
}
