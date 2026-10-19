import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppNavbar from './AppNavbar.jsx';

// La barra usa <Link>, por eso debe renderizarse dentro de un router.
function renderizarNavbar(props = {}) {
  return render(
    <MemoryRouter>
      <AppNavbar {...props} />
    </MemoryRouter>
  );
}

describe('AppNavbar', () => {
  it('muestra la marca y los enlaces principales', () => {
    renderizarNavbar();

    expect(screen.getByText('NexoTech')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ofertas' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Contacto' })).toBeTruthy();
  });

  it('muestra el total del carrito recibido por props', () => {
    renderizarNavbar({ totalCarrito: 15990 });

    // El "." del regex acepta tanto 15.990 como 15,990 según el idioma del navegador
    const carrito = screen.getByRole('link', { name: /Carrito/ });
    expect(carrito.textContent).toMatch(/15.990/);
  });

  it('muestra $0 en el carrito cuando no se entrega total', () => {
    renderizarNavbar();

    const carrito = screen.getByRole('link', { name: /Carrito/ });
    expect(carrito.textContent).toContain('$0');
  });

  it('actualiza el estado del buscador cuando el usuario escribe', () => {
    renderizarNavbar();

    const buscador = screen.getByPlaceholderText('Buscar');
    expect(buscador.value).toBe('');

    fireEvent.change(buscador, { target: { value: 'notebook' } });
    expect(buscador.value).toBe('notebook');
  });
});
