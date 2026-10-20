import { peticion } from './api.js';

export const listarCategorias = () => peticion('categorias.php');
export const crearCategoria = (datos) => peticion('categorias.php', { metodo: 'POST', cuerpo: datos });
export const actualizarCategoria = (id, datos) =>
  peticion(`categorias.php?id=${id}`, { metodo: 'PUT', cuerpo: datos });
export const eliminarCategoria = (id) => peticion(`categorias.php?id=${id}`, { metodo: 'DELETE' });
