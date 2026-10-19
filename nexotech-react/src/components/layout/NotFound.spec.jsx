import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound.jsx';

describe('NotFound', () => {
  it('muestra el mensaje de error y un enlace para volver al inicio', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText('Página no encontrada')).toBeTruthy();

    const enlace = screen.getByRole('link', { name: 'Volver al inicio' });
    expect(enlace.getAttribute('href')).toBe('/');
  });
});
