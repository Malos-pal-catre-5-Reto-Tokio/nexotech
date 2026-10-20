import { render, screen } from '@testing-library/react';
import Footer from './Footer.jsx';

describe('Footer', () => {
  it('muestra el nombre de la tienda y el año actual', () => {
    render(<Footer />);

    const texto = screen.getByText(/NexoTech — Tienda de tecnología/);
    expect(texto).toBeTruthy();
    expect(texto.textContent).toContain(String(new Date().getFullYear()));
  });
});
