import { useEffect, useState } from 'react';
import { listarCategorias } from '../services/categoriasService.js';

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    let activo = true;
    listarCategorias()
      .then((datos) => activo && setCategorias(datos))
      .catch(() => activo && setCategorias([])); // sin categorías el filtro simplemente no se muestra
    return () => { activo = false; };
  }, []);

  return categorias;
}
