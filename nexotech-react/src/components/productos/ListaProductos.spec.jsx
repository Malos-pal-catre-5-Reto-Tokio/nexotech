import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ListaProductos from './ListaProductos.jsx';
import { PRODUCTOS_DE_PRUEBA } from '../../testing/apiFalsa.js';

describe('ListaProductos', () => {
  it('renderiza una tarjeta por cada producto del conjunto de datos', () => {
    render(
      <MemoryRouter>
        <ListaProductos productos={PRODUCTOS_DE_PRUEBA} onAgregar={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(2);
    expect(screen.getByText('Mouse ErgoTech')).toBeTruthy();
    expect(screen.getByText('Teclado ProType')).toBeTruthy();
  });

  it('muestra un mensaje cuando no hay productos', () => {
    render(
      <MemoryRouter>
        <ListaProductos productos={[]} onAgregar={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('No hay productos para mostrar.')).toBeTruthy();
  });
});
