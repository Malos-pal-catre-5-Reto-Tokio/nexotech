import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
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

    // react-bootstrap pinta <Button as={Link}> con role="button".
    // El "." del regex acepta tanto 15.990 como 15,990 según el idioma del navegador
    const carrito = screen.getByRole('button', { name: /Carrito/ });
    expect(carrito.textContent).toMatch(/15.990/);
  });

  it('muestra $0 en el carrito cuando no se entrega total', () => {
    renderizarNavbar();

    const carrito = screen.getByRole('button', { name: /Carrito/ });
    expect(carrito.textContent).toContain('$0');
  });

  it('actualiza el estado del buscador cuando el usuario escribe', () => {
    renderizarNavbar();

    const buscador = screen.getByPlaceholderText('Buscar');
    expect(buscador.value).toBe('');

    fireEvent.change(buscador, { target: { value: 'notebook' } });
    expect(buscador.value).toBe('notebook');
  });

  it('al buscar navega al catálogo con el texto en la URL', () => {
    function MostrarUbicacion() {
      const ubicacion = useLocation();
      return <p data-testid="ubicacion">{ubicacion.pathname + ubicacion.search}</p>;
    }
    render(
      <MemoryRouter>
        <AppNavbar />
        <MostrarUbicacion />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Buscar'), { target: { value: 'mouse gamer' } });
    fireEvent.submit(screen.getByRole('search'));

    expect(screen.getByTestId('ubicacion').textContent).toBe('/productos?q=mouse%20gamer');
  });

  it('sin usuario muestra los botones de iniciar sesión y crear cuenta', () => {
    render(<MemoryRouter><AppNavbar /></MemoryRouter>);

    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeTruthy();
  });

  it('con usuario muestra su nombre y llama a onCerrarSesion', () => {
    const onCerrarSesion = jasmine.createSpy('onCerrarSesion');
    render(
      <MemoryRouter>
        <AppNavbar usuario={{ nombre: 'Pedro' }} onCerrarSesion={onCerrarSesion} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).toBeNull();
    fireEvent.click(screen.getByText('Hola, Pedro'));
    fireEvent.click(screen.getByText('Cerrar sesión'));

    expect(onCerrarSesion).toHaveBeenCalledTimes(1);
  });

  it('el personal ve el acceso al panel de administración y el cliente no', () => {
    const { unmount } = render(
      <MemoryRouter><AppNavbar usuario={{ nombre: 'Ana', rol: 'admin' }} /></MemoryRouter>
    );
    fireEvent.click(screen.getByText('Hola, Ana'));
    expect(screen.getByText('Panel de administración').getAttribute('href')).toBe('/admin');
    unmount();

    render(<MemoryRouter><AppNavbar usuario={{ nombre: 'Pedro', rol: 'cliente' }} /></MemoryRouter>);
    fireEvent.click(screen.getByText('Hola, Pedro'));
    expect(screen.queryByText('Panel de administración')).toBeNull();
  });

  it('si no se entrega onCerrarSesion, el menú no falla al cerrar sesión', () => {
    render(<MemoryRouter><AppNavbar usuario={{ nombre: 'Ana', rol: 'cliente' }} /></MemoryRouter>);

    fireEvent.click(screen.getByText('Hola, Ana'));

    expect(() => fireEvent.click(screen.getByText('Cerrar sesión'))).not.toThrow();
  });
});
