import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { instalarApiFalsa } from '../testing/apiFalsa.js';

const USUARIO = { id: 3, nombre: 'Pedro', apellidos: 'Cliente', correo: 'cliente@gmail.com', rol: 'cliente' };

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>Página de inicio</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
const ingresar = () => fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
const llamadasLogin = (api) => api.espia.calls.allArgs().filter(([url]) => url.includes('accion=login'));

describe('Login (página)', () => {
  let api;
  afterEach(() => api.restaurar());

  // Respuestas por defecto: nadie tiene sesión y el login acepta solo la contraseña correcta.
  beforeEach(() => {
    api = instalarApiFalsa([
      ['accion=login', (url, opciones) => (
        JSON.parse(opciones.body).password === 'cliente123' ? USUARIO : new Error('Correo o contraseña incorrectos.'))],
      ['auth.php', null],
    ]);
  });

  it('con los campos vacíos muestra los errores y no llama a la API', async () => {
    renderizar();
    await screen.findByRole('button', { name: 'Ingresar' });

    ingresar();

    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria.')).toBeTruthy();
    expect(llamadasLogin(api).length).toBe(0);
  });

  it('rechaza correos de dominios no permitidos sin llamar a la API', async () => {
    renderizar();
    await screen.findByRole('button', { name: 'Ingresar' });

    escribir(/Correo/, 'alguien@hotmail.com');
    escribir(/Contraseña/, 'cliente123');
    ingresar();

    expect(screen.getByText(/Usa un correo @duoc.cl/)).toBeTruthy();
    expect(llamadasLogin(api).length).toBe(0);
  });

  it('con credenciales correctas inicia sesión y vuelve al inicio', async () => {
    renderizar();
    await screen.findByRole('button', { name: 'Ingresar' });

    escribir(/Correo/, 'cliente@gmail.com');
    escribir(/Contraseña/, 'cliente123');
    ingresar();

    expect(await screen.findByText('Página de inicio')).toBeTruthy();
    expect(JSON.parse(llamadasLogin(api)[0][1].body)).toEqual({ correo: 'cliente@gmail.com', password: 'cliente123' });
  });

  it('con credenciales incorrectas muestra el mensaje de la API y permanece en el formulario', async () => {
    renderizar();
    await screen.findByRole('button', { name: 'Ingresar' });

    escribir(/Correo/, 'cliente@gmail.com');
    escribir(/Contraseña/, 'incorrecta');
    ingresar();

    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeTruthy();
    expect(screen.queryByText('Página de inicio')).toBeNull();
  });

  it('si ya hay sesión redirige al inicio', async () => {
    api.restaurar();
    api = instalarApiFalsa([['auth.php', USUARIO]]);

    renderizar();

    expect(await screen.findByText('Página de inicio')).toBeTruthy();
  });
});
