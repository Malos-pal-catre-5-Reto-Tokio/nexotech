import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { instalarApiFalsa, PRODUCTOS_DE_PRUEBA } from '../testing/apiFalsa.js';

describe('Home', () => {
  let api;
  beforeEach(() => localStorage.clear());
  afterEach(() => api.restaurar());

  it('muestra las secciones Ofertas y Destacados con datos de la API', async () => {
    api = instalarApiFalsa([
      ['oferta=1', [PRODUCTOS_DE_PRUEBA[1]]],
      ['productos.php', PRODUCTOS_DE_PRUEBA],
    ]);

    render(
      <MemoryRouter>
        <CarritoProvider>
          <Home />
        </CarritoProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Ofertas' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Destacados' })).toBeTruthy();
    expect(await screen.findByText('Mouse ErgoTech')).toBeTruthy();
    expect(screen.getAllByText('Teclado ProType').length).toBe(2); // aparece en ofertas y destacados
  });

  it('muestra el título de bienvenida antes de la imagen principal', () => {
    api = instalarApiFalsa([['productos.php', []]]);

    render(
      <MemoryRouter>
        <CarritoProvider>
          <Home />
        </CarritoProvider>
      </MemoryRouter>
    );

    const titulo = screen.getByRole('heading', { name: 'Bienvenido a NexoTech' });
    const imagen = screen.getByAltText('Tecnología al mejor precio');
    expect(titulo.compareDocumentPosition(imagen) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
