import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Ofertas from './Ofertas.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { instalarApiFalsa, PRODUCTOS_DE_PRUEBA } from '../testing/apiFalsa.js';

function renderizar() {
  return render(
    <MemoryRouter>
      <CarritoProvider>
        <Ofertas />
      </CarritoProvider>
    </MemoryRouter>
  );
}

describe('Ofertas (página)', () => {
  let api;
  beforeEach(() => localStorage.clear());
  afterEach(() => api.restaurar());

  it('pide a la API solo los productos en oferta y los muestra con su descuento', async () => {
    api = instalarApiFalsa([['productos.php', [PRODUCTOS_DE_PRUEBA[1]]]]);

    renderizar();

    expect(await screen.findByText('Teclado ProType')).toBeTruthy();
    expect(screen.getByText('-20%')).toBeTruthy();
    expect(api.espia.calls.mostRecent().args[0]).toContain('oferta=1');
  });

  it('muestra un mensaje cuando no hay ofertas', async () => {
    api = instalarApiFalsa([['productos.php', []]]);

    renderizar();

    expect(await screen.findByText('Por ahora no hay productos en oferta.')).toBeTruthy();
  });

  it('muestra el error si la API falla', async () => {
    api = instalarApiFalsa([['productos.php', new Error('Error de base de datos.')]]);

    renderizar();

    expect(await screen.findByText(/Error de base de datos/)).toBeTruthy();
  });
});
