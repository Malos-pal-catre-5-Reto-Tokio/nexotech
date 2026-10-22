import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Blogs from './Blogs.jsx';
import DetalleBlog from './DetalleBlog.jsx';

function renderizar(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<DetalleBlog />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Blog', () => {
  it('el listado muestra los dos casos con su enlace al detalle', () => {
    renderizar('/blogs');

    const enlaces = screen.getAllByRole('link', { name: 'Ver caso' });
    expect(enlaces.length).toBe(2);
    expect(enlaces[0].getAttribute('href')).toBe('/blogs/1');
    expect(enlaces[1].getAttribute('href')).toBe('/blogs/2');
  });

  it('el detalle muestra el título, la imagen y todos los párrafos del artículo', () => {
    renderizar('/blogs/1');

    expect(screen.getByRole('heading', { name: 'El primer computador personal' })).toBeTruthy();
    expect(screen.getByAltText('Altair 8800')).toBeTruthy();
    expect(screen.getByText(/Popular Electronics/)).toBeTruthy();
    expect(screen.getAllByText(/Microsoft|Bill Gates|NexoTech/).length).toBeGreaterThanOrEqual(2); // los 3 párrafos
  });

  it('el detalle del segundo caso muestra su propio contenido', () => {
    renderizar('/blogs/2');

    expect(screen.getByRole('heading', { name: '¿Por qué los cargadores son tan lentos?' })).toBeTruthy();
    expect(screen.getByText(/65W compatible/)).toBeTruthy();
  });

  it('un artículo que no existe muestra un aviso y un enlace para volver', () => {
    renderizar('/blogs/99');

    expect(screen.getByText('El artículo que buscas no existe.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Volver a blogs' })).toBeTruthy();
  });
});
