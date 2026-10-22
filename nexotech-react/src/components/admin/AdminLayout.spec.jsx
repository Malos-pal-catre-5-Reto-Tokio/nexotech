import { screen, fireEvent } from '@testing-library/react';
import AdminLayout from './AdminLayout.jsx';
import { renderizarConSesion } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, USUARIO_ADMIN, USUARIO_VENDEDOR } from '../../testing/apiFalsa.js';

describe('AdminLayout', () => {
  let api;
  afterEach(() => api.restaurar());

  it('el administrador ve todas las secciones del menú', async () => {
    api = instalarApiFalsa([['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<AdminLayout />);

    for (const texto of ['Dashboard', 'Órdenes', 'Productos', 'Categorías', 'Usuarios', 'Reportes', 'Perfil']) {
      expect(await screen.findByRole('link', { name: texto })).toBeTruthy();
    }
  });

  it('el vendedor no ve las secciones de gestión (categorías y usuarios)', async () => {
    api = instalarApiFalsa([['auth.php', USUARIO_VENDEDOR]]);

    renderizarConSesion(<AdminLayout />);

    expect(await screen.findByRole('link', { name: 'Órdenes' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Usuarios' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Categorías' })).toBeNull();
  });

  it('cerrar sesión cierra la sesión en el servidor y saca al usuario del panel', async () => {
    api = instalarApiFalsa([['accion=logout', { ok: true }], ['auth.php', USUARIO_ADMIN]]);
    renderizarConSesion(<AdminLayout />);

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));

    expect(await screen.findByText('Pantalla de login')).toBeTruthy();
    expect(api.espia.calls.allArgs().some(([url]) => url.includes('accion=logout'))).toBeTrue();
  });
});
