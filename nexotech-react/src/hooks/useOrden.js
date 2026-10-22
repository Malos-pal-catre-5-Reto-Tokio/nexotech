import { useEffect, useState } from 'react';
import { obtenerOrden } from '../services/ordenesService.js';

export function useOrden(id) {
  const [estado, setEstado] = useState({ orden: null, cargando: true, error: null });

  useEffect(() => {
    let activo = true;
    setEstado({ orden: null, cargando: true, error: null });
    obtenerOrden(id)
      .then((orden) => activo && setEstado({ orden, cargando: false, error: null }))
      .catch((error) => activo && setEstado({ orden: null, cargando: false, error: error.message }));
    return () => { activo = false; };
  }, [id]);

  return estado;
}
