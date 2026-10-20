import { useEffect, useState } from 'react';
import { listarProductos, obtenerProducto } from '../services/productosService.js';

// Carga la lista de productos desde la API y se vuelve a pedir cuando cambian los filtros.
export function useProductos(filtros = {}) {
  const [estado, setEstado] = useState({ productos: [], cargando: true, error: null });
  const clave = JSON.stringify(filtros); // clave estable para el arreglo de dependencias

  useEffect(() => {
    let activo = true; // evita actualizar el estado si el componente ya se desmontó
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));

    listarProductos(JSON.parse(clave))
      .then((productos) => activo && setEstado({ productos, cargando: false, error: null }))
      .catch((error) => activo && setEstado({ productos: [], cargando: false, error: error.message }));

    return () => { activo = false; };
  }, [clave]);

  return estado;
}

// Carga un solo producto por id (página de detalle).
export function useProducto(id) {
  const [estado, setEstado] = useState({ producto: null, cargando: true, error: null });

  useEffect(() => {
    let activo = true;
    setEstado({ producto: null, cargando: true, error: null });

    obtenerProducto(id)
      .then((producto) => activo && setEstado({ producto, cargando: false, error: null }))
      .catch((error) => activo && setEstado({ producto: null, cargando: false, error: error.message }));

    return () => { activo = false; };
  }, [id]);

  return estado;
}
