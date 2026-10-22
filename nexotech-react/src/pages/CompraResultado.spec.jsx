import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CompraExitosa from './CompraExitosa.jsx';
import CompraError from './CompraError.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { instalarApiFalsa } from '../testing/apiFalsa.js';

const ORDEN = {
  id: 8, codigo: 'ORD-000008', estado: 'fallida', descuento: 0, total: 20000,
  cliente: { nombre: 'Pedro', apellidos: 'Pérez', correo: 'pedro@example.com' },
  entrega: { calle: 'Los Crisantemos 123', departamento: '603', region: 'Región de Tarapacá', comuna: 'Iquique', indicaciones: 'Dejar con el conserje' },
  items: [{ productoId: 1, nombre: 'Mouse', precio: 10000, cantidad: 2, subtotal: 20000 }],
};

function renderizar(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <CarritoProvider>
        <Routes>
          <Route path="/compra/exitosa/:id" element={<CompraExitosa />} />
          <Route path="/compra/error/:id" element={<CompraError />} />
        </Routes>
      </CarritoProvider>
    </MemoryRouter>
  );
}

describe('Vistas de resultado de la compra', () => {
  let api;
  beforeEach(() => localStorage.clear());
  afterEach(() => api.restaurar());

  it('compra exitosa: muestra número, código, cliente, dirección y total', async () => {
    api = instalarApiFalsa([['ordenes.php?id=8', { ...ORDEN, estado: 'pagada' }]]);

    renderizar('/compra/exitosa/8');

    expect(await screen.findByText(/Se ha realizado la compra. nro #8/)).toBeTruthy();
    expect(screen.getByText(/ORD-000008/)).toBeTruthy();
    expect(screen.getByText(/Pedro Pérez/)).toBeTruthy();
    expect(screen.getByText(/Iquique, Región de Tarapacá/)).toBeTruthy();
    expect(screen.getByTestId('total-orden').textContent).toMatch(/20.000/);
  });

  it('compra exitosa: muestra el error si la orden no existe', async () => {
    api = instalarApiFalsa([['ordenes.php?id=99', new Error('Orden no encontrada.')]]);

    renderizar('/compra/exitosa/99');

    expect(await screen.findByText('Orden no encontrada.')).toBeTruthy();
  });

  it('pago con error: ofrece volver a pagar y, si resulta, lleva a la compra exitosa', async () => {
    api = instalarApiFalsa([['ordenes.php?id=8', (url, opciones) => (
      opciones?.method === 'PUT' ? { ...ORDEN, estado: 'pagada' } : ORDEN)]]);
    localStorage.setItem('nexotech_carrito', JSON.stringify([{ id: 1, nombre: 'Mouse', precio: 10000, stock: 5, cantidad: 2 }]));

    renderizar('/compra/error/8');
    fireEvent.click(await screen.findByRole('button', { name: 'VOLVER A REALIZAR EL PAGO' }));

    expect(await screen.findByText(/Se ha realizado la compra/)).toBeTruthy();
    const metodos = api.espia.calls.allArgs().map((argumentos) => argumentos[1]?.method);
    expect(metodos).toContain('PUT');
    expect(JSON.parse(localStorage.getItem('nexotech_carrito'))).toEqual([]);
  });

  it('pago con error: si el reintento falla muestra el motivo y no sale de la vista', async () => {
    api = instalarApiFalsa([['ordenes.php?id=8', (url, opciones) => (
      opciones?.method === 'PUT' ? new Error('Stock insuficiente para Mouse.') : ORDEN)]]);

    renderizar('/compra/error/8');
    fireEvent.click(await screen.findByRole('button', { name: 'VOLVER A REALIZAR EL PAGO' }));

    expect(await screen.findByText('Stock insuficiente para Mouse.')).toBeTruthy();
    expect(screen.getByText(/No se pudo realizar el pago/)).toBeTruthy();
  });

  it('pago con error: si la orden no existe muestra el mensaje de la API', async () => {
    api = instalarApiFalsa([['ordenes.php?id=99', new Error('Orden no encontrada.')]]);

    renderizar('/compra/error/99');

    expect(await screen.findByText('Orden no encontrada.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'VOLVER A REALIZAR EL PAGO' })).toBeNull();
  });
});
