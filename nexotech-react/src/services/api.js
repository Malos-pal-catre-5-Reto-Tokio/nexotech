import { API_URL } from '../config.js';

// Envuelve fetch: arma la URL, manda/recibe JSON y convierte los errores HTTP en excepciones
// con el mensaje que devuelve el PHP ({ "error": "..." }).
export async function peticion(ruta, { metodo = 'GET', cuerpo } = {}) {
  const opciones = { method: metodo, headers: { 'Content-Type': 'application/json' } };
  if (cuerpo !== undefined) opciones.body = JSON.stringify(cuerpo);

  const respuesta = await fetch(`${API_URL}/${ruta}`, opciones);
  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(datos?.error ?? `Error ${respuesta.status} al llamar a ${ruta}`);
  }
  return datos;
}
