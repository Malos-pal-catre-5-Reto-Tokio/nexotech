import { screen, fireEvent, within } from '@testing-library/react';
import CategoriasAdmin from './CategoriasAdmin.jsx';
import FormCategoria from './FormCategoria.jsx';
import { renderizarConSesion, llamadas } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, CATEGORIAS_DE_PRUEBA, USUARIO_ADMIN } from '../../testing/apiFalsa.js';

const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
const guardar = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
const LISTA = <p>Lista de categorías</p>;

describe('Categorías (admin)', () => {
  let api;
  afterEach(() => api.restaurar());

  it('lista las categorías con su identificador', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<CategoriasAdmin />, { roles: ['admin'] });

    expect(await screen.findByText('Celulares')).toBeTruthy();
    expect(screen.getByText('accesorios')).toBeTruthy();
  });

  it('elimina una categoría después de confirmar', async () => {
    api = instalarApiFalsa([
      ['categorias.php?id=2', { eliminado: 2 }], ['categorias.php', CATEGORIAS_DE_PRUEBA], ['auth.php', USUARIO_ADMIN],
    ]);
    renderizarConSesion(<CategoriasAdmin />, { roles: ['admin'] });

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Celulares' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('Categoría "Celulares" eliminada.')).toBeTruthy();
    expect(llamadas(api, 'categorias.php?id=2', 'DELETE').length).toBe(1);
  });

  it('si la categoría todavía tiene productos muestra el motivo que entrega la API', async () => {
    api = instalarApiFalsa([
      ['categorias.php?id=2', new Error('No se puede completar: el slug ya existe o la categoría tiene productos.')],
      ['categorias.php', CATEGORIAS_DE_PRUEBA], ['auth.php', USUARIO_ADMIN],
    ]);
    renderizarConSesion(<CategoriasAdmin />, { roles: ['admin'] });

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Celulares' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText(/la categoría tiene productos/)).toBeTruthy();
  });

  it('el formulario valida el identificador antes de enviar', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['auth.php', USUARIO_ADMIN]]);
    renderizarConSesion(<FormCategoria />, { patron: '/admin/categorias/nueva', ruta: '/admin/categorias/nueva', roles: ['admin'] });
    await screen.findByRole('button', { name: 'Guardar' });

    escribir(/^Nombre/, 'Monitores');
    escribir(/^Identificador/, 'Con Espacios');
    guardar();

    expect(screen.getByText(/minúsculas, números o guiones/)).toBeTruthy();
    expect(llamadas(api, 'categorias.php', 'POST').length).toBe(0);
  });

  it('crea una categoría con POST y vuelve al listado', async () => {
    api = instalarApiFalsa([
      ['categorias.php', (url, op) => (op?.method === 'POST' ? { id: 9 } : CATEGORIAS_DE_PRUEBA)], ['auth.php', USUARIO_ADMIN],
    ]);
    renderizarConSesion(<FormCategoria />, {
      patron: '/admin/categorias/nueva', ruta: '/admin/categorias/nueva', roles: ['admin'], extra: [['/admin/categorias', LISTA]],
    });
    await screen.findByRole('button', { name: 'Guardar' });

    escribir(/^Nombre/, 'Monitores');
    escribir(/^Identificador/, 'monitores');
    guardar();

    expect(await screen.findByText('Lista de categorías')).toBeTruthy();
    expect(llamadas(api, 'categorias.php', 'POST')[0].cuerpo).toEqual({ slug: 'monitores', nombre: 'Monitores' });
  });

  it('al editar carga la categoría y la actualiza con PUT', async () => {
    api = instalarApiFalsa([
      ['categorias.php?id=3', { id: 3 }], ['categorias.php', CATEGORIAS_DE_PRUEBA], ['auth.php', USUARIO_ADMIN],
    ]);
    renderizarConSesion(<FormCategoria />, {
      patron: '/admin/categorias/:id/editar', ruta: '/admin/categorias/3/editar', roles: ['admin'],
      extra: [['/admin/categorias', LISTA]],
    });

    expect(await screen.findByDisplayValue('Accesorios')).toBeTruthy();
    escribir(/^Nombre/, 'Accesorios PC');
    guardar();

    expect(await screen.findByText('Lista de categorías')).toBeTruthy();
    expect(llamadas(api, 'categorias.php?id=3', 'PUT')[0].cuerpo).toEqual({ slug: 'accesorios', nombre: 'Accesorios PC' });
  });

  it('cancelar la confirmación no elimina y se puede cerrar el aviso de resultado', async () => {
    api = instalarApiFalsa([
      ['categorias.php?id=2', { eliminado: 2 }], ['categorias.php', CATEGORIAS_DE_PRUEBA], ['auth.php', USUARIO_ADMIN],
    ]);
    renderizarConSesion(<CategoriasAdmin />, { roles: ['admin'] });

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Celulares' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
    expect(llamadas(api, 'categorias.php', 'DELETE').length).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Celulares' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));
    await screen.findByText('Categoría "Celulares" eliminada.');
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByText('Categoría "Celulares" eliminada.')).toBeNull();
  });

  it('el formulario muestra el error de la API si el identificador ya existe', async () => {
    api = instalarApiFalsa([
      ['categorias.php', (url, op) => (op?.method === 'POST' ? new Error('No se puede completar: el slug ya existe.') : CATEGORIAS_DE_PRUEBA)],
      ['auth.php', USUARIO_ADMIN],
    ]);
    renderizarConSesion(<FormCategoria />, { patron: '/admin/categorias/nueva', ruta: '/admin/categorias/nueva', roles: ['admin'] });
    await screen.findByRole('button', { name: 'Guardar' });

    escribir(/^Nombre/, 'Accesorios');
    escribir(/^Identificador/, 'accesorios');
    guardar();

    expect(await screen.findByText(/el slug ya existe/)).toBeTruthy();
  });
});
