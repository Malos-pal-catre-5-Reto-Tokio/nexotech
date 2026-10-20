import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Carrito from './Carrito.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';

function renderizar() {
  return render(
    <MemoryRouter>
      <CarritoProvider>
        <Carrito />
      </CarritoProvider>
    </MemoryRouter>
  );
}

const total = () => screen.getByTestId('total-carrito').textContent;

describe('Carrito (página)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('nexotech_carrito', JSON.stringify([
      { id: 1, nombre: 'Mouse', precio: 10000, stock: 3, cantidad: 1, imagen: '' },
    ]));
  });

  it('lista los productos guardados y calcula el total', () => {
    renderizar();

    expect(screen.getByText('Mouse')).toBeTruthy();
    expect(total()).toMatch(/10.000/);
  });

  it('aumentar la cantidad actualiza el total y respeta el stock', () => {
    renderizar();
    const aumentar = screen.getByRole('button', { name: 'Aumentar cantidad de Mouse' });

    fireEvent.click(aumentar);
    fireEvent.click(aumentar); // llega a 3 = stock

    expect(total()).toMatch(/30.000/);
    expect(aumentar.disabled).toBeTrue();
  });

  it('quitar el último producto muestra el mensaje de carrito vacío', () => {
    renderizar();

    fireEvent.click(screen.getByRole('button', { name: 'Quitar Mouse' }));

    expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();
  });

  it('un cupón válido aplica el descuento y uno inválido muestra error', () => {
    renderizar();
    const campo = screen.getByLabelText('Código de cupón');

    fireEvent.change(campo, { target: { value: 'FALSO' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(screen.getByText('El cupón no es válido.')).toBeTruthy();

    fireEvent.change(campo, { target: { value: 'nexo10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
    expect(screen.getByText('Cupón aplicado.')).toBeTruthy();
    expect(total()).toMatch(/9.000/);
  });
});
