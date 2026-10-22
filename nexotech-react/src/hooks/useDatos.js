import { useEffect, useState } from 'react';

// Ejecuta una función asíncrona (llamada a la API) y entrega { datos, cargando, error, recargar }.
// Se vuelve a ejecutar cuando cambian las dependencias o al llamar a recargar().
export function useDatos(cargar, dependencias = []) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let activo = true;
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));
    cargar()
      .then((datos) => activo && setEstado({ datos, cargando: false, error: null }))
      .catch((error) => activo && setEstado({ datos: null, cargando: false, error: error.message }));
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...dependencias]);

  return { ...estado, recargar: () => setVersion((v) => v + 1) };
}
