import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductoCard from './ProductoCard.jsx';

const producto = { id: 1, nombre: 'Teclado ProType', precio: 40000, descuento: 0, stock: 3, imagen: '/img/t.jpg' };

function renderizar(props = {}) {
  const onAgregar = jasmine.createSpy('onAgregar');
  render(
    <MemoryRouter>
      <ProductoCard producto={producto} onAgregar={onAgregar} {...props} />
    </MemoryRouter>
  );
  return onAgregar;
}

describe('ProductoCard', () => {
  it('muestra el nombre y el precio formateado recibidos por props', () => {
    renderizar();

    expect(screen.getByText('Teclado ProType')).toBeTruthy();
    expect(screen.getByText(/40.000/)).toBeTruthy();
  });

  it('en oferta muestra la insignia de descuento y el precio rebajado', () => {
    renderizar({ producto: { ...producto, descuento: 20 } });

    expect(screen.getByText('-20%')).toBeTruthy();
    expect(screen.getByText(/32.000/)).toBeTruthy(); // 40.000 con 20% de descuento
  });

  it('al hacer clic en "Añadir al carrito" llama a onAgregar con el producto', () => {
    const onAgregar = renderizar();

    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }));

    expect(onAgregar).toHaveBeenCalledWith(producto);
  });

  it('sin stock deshabilita el botón y avisa al usuario', () => {
    renderizar({ producto: { ...producto, stock: 0 } });

    expect(screen.getByRole('button', { name: 'Añadir al carrito' }).disabled).toBeTrue();
    expect(screen.getByText('Sin stock')).toBeTruthy();
  });
});
