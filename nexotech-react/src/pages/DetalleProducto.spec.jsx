import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DetalleProducto from './DetalleProducto.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { instalarApiFalsa, PRODUCTOS_DE_PRUEBA } from '../testing/apiFalsa.js';

function renderizar(id) {
  return render(
    <MemoryRouter initialEntries={[`/productos/${id}`]}>
      <CarritoProvider>
        <Routes>
          <Route path="/productos/:id" element={<DetalleProducto />} />
        </Routes>
      </CarritoProvider>
    </MemoryRouter>
  );
}

describe('DetalleProducto (página)', () => {
  let api;
  beforeEach(() => localStorage.clear());
  afterEach(() => api.restaurar());

  it('pide el producto de la URL y muestra su información', async () => {
    api = instalarApiFalsa([['productos.php?id=1', PRODUCTOS_DE_PRUEBA[0]]]);

    renderizar(1);

    expect(await screen.findByRole('heading', { name: 'Mouse ErgoTech' })).toBeTruthy();
    expect(screen.getByText('Mouse ergonómico')).toBeTruthy();
    expect(screen.getByText(/Stock disponible: 5/)).toBeTruthy();
  });

  it('añade al carrito la cantidad elegida', async () => {
    api = instalarApiFalsa([['productos.php?id=1', PRODUCTOS_DE_PRUEBA[0]]]);
    renderizar(1);
    await screen.findByRole('heading', { name: 'Mouse ErgoTech' });

    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }));

    expect(screen.getByRole('status').textContent).toContain('Producto añadido');
    expect(JSON.parse(localStorage.getItem('nexotech_carrito'))[0].cantidad).toBe(3);
  });

  it('no deja pasar del stock y muestra el motivo', async () => {
    api = instalarApiFalsa([['productos.php?id=1', PRODUCTOS_DE_PRUEBA[0]]]);
    renderizar(1);
    await screen.findByRole('heading', { name: 'Mouse ErgoTech' });

    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '9' } }); // stock = 5
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carrito' }));

    expect(screen.getByRole('status').textContent).toContain('Solo puedes añadir 5');
  });

  it('muestra el error de la API cuando el producto no existe', async () => {
    api = instalarApiFalsa([['productos.php?id=99', new Error('Producto no encontrado.')]]);

    renderizar(99);

    expect(await screen.findByText('Producto no encontrado.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toBeTruthy();
  });
});
