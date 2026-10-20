import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { instalarApiFalsa } from '../testing/apiFalsa.js';

const USUARIO = { id: 3, nombre: 'Pedro', apellidos: 'Cliente', correo: 'cliente@gmail.com', rol: 'cliente' };

function Panel() {
  const { usuario, cargando, iniciarSesion, cerrarSesion } = useAuth();
  const [error, setError] = useState('');
  const entrar = () => iniciarSesion('cliente@gmail.com', 'clave').catch((e) => setError(e.message));
  return (
    <div>
      <p data-testid="estado">{cargando ? 'cargando' : usuario ? `sesión de ${usuario.nombre}` : 'invitado'}</p>
      <button onClick={entrar}>entrar</button>
      <button onClick={cerrarSesion}>salir</button>
      <p role="alert">{error}</p>
    </div>
  );
}

const renderizar = () => render(<AuthProvider><Panel /></AuthProvider>);

describe('AuthContext', () => {
  let api;
  afterEach(() => api.restaurar());

  it('sin sesión en el servidor queda como invitado después de cargar', async () => {
    api = instalarApiFalsa([['auth.php', null]]);

    renderizar();

    expect(screen.getByTestId('estado').textContent).toBe('cargando');
    expect(await screen.findByText('invitado')).toBeTruthy();
  });

  it('recupera la sesión que ya existe en el servidor', async () => {
    api = instalarApiFalsa([['auth.php', USUARIO]]);

    renderizar();

    expect(await screen.findByText('sesión de Pedro')).toBeTruthy();
  });

  it('iniciarSesion envía las credenciales por POST y guarda el usuario', async () => {
    api = instalarApiFalsa([['accion=login', USUARIO], ['auth.php', null]]);
    renderizar();
    await screen.findByText('invitado');

    fireEvent.click(screen.getByText('entrar'));

    expect(await screen.findByText('sesión de Pedro')).toBeTruthy();
    const llamada = api.espia.calls.allArgs().find(([url]) => url.includes('accion=login'));
    expect(llamada[1].method).toBe('POST');
    expect(JSON.parse(llamada[1].body)).toEqual({ correo: 'cliente@gmail.com', password: 'clave' });
  });

  it('si las credenciales son incorrectas propaga el mensaje y no inicia sesión', async () => {
    api = instalarApiFalsa([['accion=login', new Error('Correo o contraseña incorrectos.')], ['auth.php', null]]);
    renderizar();
    await screen.findByText('invitado');

    fireEvent.click(screen.getByText('entrar'));

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeTruthy();
    expect(screen.getByTestId('estado').textContent).toBe('invitado');
  });

  it('cerrarSesion avisa al servidor y deja al usuario como invitado', async () => {
    api = instalarApiFalsa([['accion=logout', { ok: true }], ['auth.php', USUARIO]]);
    renderizar();
    await screen.findByText('sesión de Pedro');

    fireEvent.click(screen.getByText('salir'));

    expect(await screen.findByText('invitado')).toBeTruthy();
    expect(api.espia.calls.allArgs().some(([url]) => url.includes('accion=logout'))).toBeTrue();
  });

  it('descarta respuestas que no tienen forma de usuario', async () => {
    api = instalarApiFalsa([['auth.php', []]]);

    renderizar();

    expect(await screen.findByText('invitado')).toBeTruthy();
  });

  it('useAuth lanza un error si se usa fuera del proveedor', () => {
    api = instalarApiFalsa([]);
    spyOn(console, 'error');

    expect(() => render(<Panel />)).toThrowError(/AuthProvider/);
  });
});
