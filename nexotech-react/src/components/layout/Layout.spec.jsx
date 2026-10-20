import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout.jsx';
import { CarritoProvider } from '../../context/CarritoContext.jsx';

describe('Layout', () => {
  beforeEach(() => localStorage.clear());

  it('muestra en la barra el total del carrito guardado', () => {
    localStorage.setItem('nexotech_carrito', JSON.stringify([
      { id: 1, nombre: 'Mouse', precio: 10000, stock: 5, cantidad: 2 },
    ]));

    render(
      <MemoryRouter>
        <CarritoProvider>
          <Layout />
        </CarritoProvider>
      </MemoryRouter>
    );

    const carrito = screen.getByRole('button', { name: /Carrito/ });
    expect(carrito.textContent).toMatch(/20.000/);
  });
});
