import { screen } from '@testing-library/react';
import Dashboard from './Dashboard.jsx';
import { renderizarConSesion } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, REPORTES_DE_PRUEBA, USUARIO_ADMIN, USUARIO_VENDEDOR } from '../../testing/apiFalsa.js';

describe('Dashboard (admin)', () => {
  let api;
  afterEach(() => api.restaurar());

  it('muestra los indicadores de compras, productos y usuarios que entrega la API', async () => {
    api = instalarApiFalsa([['reportes.php', REPORTES_DE_PRUEBA], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<Dashboard />);

    expect(await screen.findByText('Compras')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText(/Ingresos: .*350.000/)).toBeTruthy();
    expect(screen.getByText(/Nuevos usuarios este mes: 1/)).toBeTruthy();
  });

  it('el administrador ve los accesos a todas las secciones y el vendedor solo a las suyas', async () => {
    api = instalarApiFalsa([['reportes.php', REPORTES_DE_PRUEBA], ['auth.php', USUARIO_ADMIN]]);
    const { unmount } = renderizarConSesion(<Dashboard />);
    expect(await screen.findByRole('link', { name: /Usuarios/ })).toBeTruthy();
    unmount();
    api.restaurar();

    api = instalarApiFalsa([['reportes.php', REPORTES_DE_PRUEBA], ['auth.php', USUARIO_VENDEDOR]]);
    renderizarConSesion(<Dashboard />);
    expect(await screen.findByRole('link', { name: /Órdenes/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Usuarios/ })).toBeNull();
  });

  it('muestra el error si no se pueden cargar los reportes', async () => {
    api = instalarApiFalsa([['reportes.php', new Error('Error de base de datos.')], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<Dashboard />);

    expect(await screen.findByText('Error de base de datos.')).toBeTruthy();
  });
});
