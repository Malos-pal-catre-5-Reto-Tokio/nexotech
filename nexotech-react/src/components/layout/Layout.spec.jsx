import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout.jsx';
import { CarritoProvider } from '../../context/CarritoContext.jsx';
import { AuthProvider } from '../../context/AuthContext.jsx';
import { instalarApiFalsa } from '../../testing/apiFalsa.js';

function renderizar() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CarritoProvider>
          <Layout />
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  let api;
  beforeEach(() => localStorage.clear());
  afterEach(() => api.restaurar());

  it('muestra en la barra el total del carrito guardado', () => {
    api = instalarApiFalsa([['auth.php', null]]);
    localStorage.setItem('nexotech_carrito', JSON.stringify([
      { id: 1, nombre: 'Mouse', precio: 10000, stock: 5, cantidad: 2 },
    ]));

    renderizar();

    const carrito = screen.getByRole('button', { name: /Carrito/ });
    expect(carrito.textContent).toMatch(/20.000/);
  });

  it('sin sesión ofrece iniciar sesión y crear cuenta', async () => {
    api = instalarApiFalsa([['auth.php', null]]);

    renderizar();

    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeTruthy();
  });

  it('con sesión saluda al usuario y permite cerrar la sesión', async () => {
    api = instalarApiFalsa([
      ['accion=logout', { ok: true }],
      ['auth.php', { id: 3, nombre: 'Pedro', apellidos: 'Cliente', correo: 'cliente@gmail.com', rol: 'cliente' }],
    ]);
    renderizar();

    fireEvent.click(await screen.findByText('Hola, Pedro'));
    fireEvent.click(await screen.findByText('Cerrar sesión'));

    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(screen.queryByText('Hola, Pedro')).toBeNull();
  });
});
