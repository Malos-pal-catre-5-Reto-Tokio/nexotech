import { render, screen, waitFor } from '@testing-library/react';
import { useCategorias } from './useCategorias.js';
import { instalarApiFalsa, CATEGORIAS_DE_PRUEBA } from '../testing/apiFalsa.js';

function Lista() {
  const categorias = useCategorias();
  return <ul>{categorias.map((c) => <li key={c.id}>{c.nombre}</li>)}</ul>;
}

describe('useCategorias', () => {
  let api;
  afterEach(() => api.restaurar());

  it('entrega las categorías que devuelve la API', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA]]);

    render(<Lista />);

    expect(await screen.findByText('Celulares')).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBe(2);
  });

  it('si la API falla devuelve una lista vacía en vez de romper la página', async () => {
    api = instalarApiFalsa([['categorias.php', new Error('Error de base de datos.')]]);

    render(<Lista />);

    // waitFor espera a que la promesa rechazada se resuelva y el hook aplique su estado
    await waitFor(() => new Promise((resolver) => setTimeout(resolver, 20)));
    expect(screen.queryAllByRole('listitem').length).toBe(0);
  });
});
