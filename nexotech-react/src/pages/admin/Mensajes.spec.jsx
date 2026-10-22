import { screen } from '@testing-library/react';
import Mensajes from './Mensajes.jsx';
import { renderizarConSesion } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, USUARIO_VENDEDOR } from '../../testing/apiFalsa.js';

const MENSAJES = [
  { id: 2, nombre: 'Ana Soto', correo: 'ana@gmail.com', comentario: '¿Tienen stock del notebook gamer?', creadoEn: '2026-10-19 18:00:00' },
  { id: 1, nombre: 'Luis Pérez', correo: 'luis@duoc.cl', comentario: 'Quiero cotizar 5 teclados.', creadoEn: '2026-10-18 09:30:00' },
];

describe('Mensajes de contacto (admin)', () => {
  let api;
  afterEach(() => api.restaurar());

  it('lista los mensajes recibidos con su autor y comentario', async () => {
    api = instalarApiFalsa([['contacto.php', MENSAJES], ['auth.php', USUARIO_VENDEDOR]]);

    renderizarConSesion(<Mensajes />);

    expect(await screen.findByText('Ana Soto')).toBeTruthy();
    expect(screen.getByText('¿Tienen stock del notebook gamer?')).toBeTruthy();
    expect(screen.getByText('luis@duoc.cl')).toBeTruthy();
  });

  it('avisa cuando todavía no hay mensajes', async () => {
    api = instalarApiFalsa([['contacto.php', []], ['auth.php', USUARIO_VENDEDOR]]);

    renderizarConSesion(<Mensajes />);

    expect(await screen.findByText('Todavía no hay mensajes.')).toBeTruthy();
  });

  it('muestra el error si la API niega el acceso', async () => {
    api = instalarApiFalsa([['contacto.php', new Error('No tienes permisos para esta acción.')], ['auth.php', USUARIO_VENDEDOR]]);

    renderizarConSesion(<Mensajes />);

    expect(await screen.findByText('No tienes permisos para esta acción.')).toBeTruthy();
  });
});
