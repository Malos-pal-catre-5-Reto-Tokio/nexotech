import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Categorias from './Categorias.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { instalarApiFalsa, PRODUCTOS_DE_PRUEBA, CATEGORIAS_DE_PRUEBA } from '../testing/apiFalsa.js';

function renderizar(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <CarritoProvider>
        <Routes>
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/categorias/:slug" element={<Categorias />} />
        </Routes>
      </CarritoProvider>
    </MemoryRouter>
  );
}

const urlsPedidas = (api) => api.espia.calls.allArgs().map((argumentos) => argumentos[0]);

describe('Categorias (página)', () => {
  let api;
  beforeEach(() => {
    localStorage.clear();
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['productos.php', PRODUCTOS_DE_PRUEBA]]);
  });
  afterEach(() => api.restaurar());

  it('sin categoría elegida muestra todas las categorías y todos los productos', async () => {
    renderizar('/categorias');

    expect(await screen.findByRole('link', { name: /Celulares/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Accesorios/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Todos los productos' })).toBeTruthy();
    expect(await screen.findByText('Mouse ErgoTech')).toBeTruthy();
  });

  it('con una categoría en la URL pide solo esos productos y muestra su nombre', async () => {
    renderizar('/categorias/accesorios');

    expect(await screen.findByRole('heading', { name: 'Accesorios' })).toBeTruthy();
    await screen.findByText('Mouse ErgoTech');
    expect(urlsPedidas(api).some((url) => url.includes('categoria=accesorios'))).toBeTrue();
  });

  it('marca como activa la tarjeta de la categoría seleccionada', async () => {
    renderizar('/categorias/celulares');

    const tarjeta = await screen.findByRole('link', { name: /Celulares/ });

    expect(tarjeta.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: /Accesorios/ }).getAttribute('aria-current')).toBeNull();
  });

  it('avisa cuando la categoría de la URL no existe', async () => {
    renderizar('/categorias/inexistente');

    expect(await screen.findByText(/no existe/)).toBeTruthy();
  });
});
