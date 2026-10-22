import { render, screen } from '@testing-library/react';
import Nosotros from './Nosotros.jsx';

describe('Nosotros (página)', () => {
  it('presenta la empresa y al equipo de desarrollo', () => {
    render(<Nosotros />);

    expect(screen.getByRole('heading', { name: 'Sobre NexoTech' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Martin' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Eidan' })).toBeTruthy();
    expect(screen.getByAltText('Foto de Martin')).toBeTruthy();
  });
});
