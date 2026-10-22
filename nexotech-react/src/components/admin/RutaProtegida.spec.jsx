import { screen } from '@testing-library/react';
import { renderizarConSesion } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, USUARIO_ADMIN, USUARIO_CLIENTE, USUARIO_VENDEDOR } from '../../testing/apiFalsa.js';

describe('RutaProtegida', () => {
  let api;
  afterEach(() => api.restaurar());

  it('sin sesión redirige a la pantalla de login', async () => {
    api = instalarApiFalsa([['auth.php', null]]);

    renderizarConSesion(<p>Contenido secreto</p>);

    expect(await screen.findByText('Pantalla de login')).toBeTruthy();
    expect(screen.queryByText('Contenido secreto')).toBeNull();
  });

  it('un cliente no puede entrar al panel y ve el mensaje de permisos', async () => {
    api = instalarApiFalsa([['auth.php', USUARIO_CLIENTE]]);

    renderizarConSesion(<p>Contenido secreto</p>);

    expect(await screen.findByText(/No tienes permisos/)).toBeTruthy();
    expect(screen.queryByText('Contenido secreto')).toBeNull();
  });

  it('el personal permitido ve el contenido', async () => {
    api = instalarApiFalsa([['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<p>Contenido secreto</p>);

    expect(await screen.findByText('Contenido secreto')).toBeTruthy();
  });

  it('un vendedor no entra a una sección reservada al administrador', async () => {
    api = instalarApiFalsa([['auth.php', USUARIO_VENDEDOR]]);

    renderizarConSesion(<p>Gestión de usuarios</p>, { roles: ['admin'] });

    expect(await screen.findByText(/No tienes permisos/)).toBeTruthy();
    expect(screen.queryByText('Gestión de usuarios')).toBeNull();
  });
});
