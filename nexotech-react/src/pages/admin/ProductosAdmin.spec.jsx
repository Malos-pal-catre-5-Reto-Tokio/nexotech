import { screen, fireEvent, within } from '@testing-library/react';
import ProductosAdmin from './ProductosAdmin.jsx';
import { renderizarConSesion, urlsPedidas, llamadas } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, PRODUCTOS_ADMIN, USUARIO_ADMIN, USUARIO_VENDEDOR } from '../../testing/apiFalsa.js';

describe('ProductosAdmin', () => {
  let api;
  afterEach(() => api.restaurar());

  it('lista los productos y marca como crítico el que tiene poco stock', async () => {
    api = instalarApiFalsa([['productos.php', PRODUCTOS_ADMIN], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<ProductosAdmin />);

    expect(await screen.findByText('AC-001')).toBeTruthy();
    expect(screen.getByText('Teclado ProType')).toBeTruthy();
    expect(screen.getAllByText('Crítico').length).toBe(1); // stock 2 <= crítico 3; el otro tiene stock 10
    expect(screen.getByText('-20%')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Nuevo producto' })).toBeTruthy();
  });

  it('con la propiedad "criticos" pide solo los productos críticos a la API', async () => {
    api = instalarApiFalsa([['productos.php', [PRODUCTOS_ADMIN[0]]], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<ProductosAdmin criticos />);

    expect(await screen.findByRole('heading', { name: 'Productos críticos' })).toBeTruthy();
    await screen.findByText('AC-001');
    expect(urlsPedidas(api).some((url) => url.includes('critico=1'))).toBeTrue();
  });

  it('el vendedor ve la lista pero no puede crear, editar ni eliminar', async () => {
    api = instalarApiFalsa([['productos.php', PRODUCTOS_ADMIN], ['auth.php', USUARIO_VENDEDOR]]);

    renderizarConSesion(<ProductosAdmin />);

    await screen.findByText('AC-001');
    expect(screen.queryByRole('link', { name: 'Nuevo producto' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
    expect(screen.queryByRole('link', { name: /Editar/ })).toBeNull();
  });

  it('eliminar pide confirmación, envía el DELETE y avisa del resultado', async () => {
    api = instalarApiFalsa([
      ['productos.php?id=1', { eliminado: 1 }],
      ['productos.php', PRODUCTOS_ADMIN],
      ['auth.php', USUARIO_ADMIN],
    ]);
    renderizarConSesion(<ProductosAdmin />);
    await screen.findByText('AC-001');

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Mouse ErgoTech' }));
    const dialogo = screen.getByRole('dialog');
    expect(within(dialogo).getByText(/no se puede deshacer/)).toBeTruthy();
    expect(llamadas(api, 'productos.php?id=1', 'DELETE').length).toBe(0); // todavía no se eliminó
    fireEvent.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('Producto "Mouse ErgoTech" eliminado.')).toBeTruthy();
    expect(llamadas(api, 'productos.php?id=1', 'DELETE').length).toBe(1);
  });

  it('cancelar la confirmación no elimina nada', async () => {
    api = instalarApiFalsa([['productos.php', PRODUCTOS_ADMIN], ['auth.php', USUARIO_ADMIN]]);
    renderizarConSesion(<ProductosAdmin />);
    await screen.findByText('AC-001');

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Mouse ErgoTech' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));

    expect(llamadas(api, 'productos.php', 'DELETE').length).toBe(0);
  });

  it('si la API rechaza la eliminación muestra el motivo', async () => {
    api = instalarApiFalsa([
      ['productos.php?id=1', new Error('No tienes permisos para esta acción.')],
      ['productos.php', PRODUCTOS_ADMIN],
      ['auth.php', USUARIO_ADMIN],
    ]);
    renderizarConSesion(<ProductosAdmin />);
    await screen.findByText('AC-001');

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Mouse ErgoTech' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('No tienes permisos para esta acción.')).toBeTruthy();
  });

  it('el aviso del resultado se puede cerrar', async () => {
    api = instalarApiFalsa([
      ['productos.php?id=1', { eliminado: 1 }], ['productos.php', PRODUCTOS_ADMIN], ['auth.php', USUARIO_ADMIN],
    ]);
    renderizarConSesion(<ProductosAdmin />);
    await screen.findByText('AC-001');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Mouse ErgoTech' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));
    await screen.findByText('Producto "Mouse ErgoTech" eliminado.');

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByText('Producto "Mouse ErgoTech" eliminado.')).toBeNull();
  });
});
