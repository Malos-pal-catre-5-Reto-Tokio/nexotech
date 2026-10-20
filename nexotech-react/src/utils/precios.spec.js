import { precioFinal, formatearPrecio } from './precios.js';

describe('precios', () => {
  it('precioFinal devuelve el precio original cuando no hay descuento', () => {
    expect(precioFinal({ precio: 549990, descuento: 0 })).toBe(549990);
    expect(precioFinal({ precio: 549990 })).toBe(549990);
  });

  it('precioFinal aplica el porcentaje de oferta', () => {
    expect(precioFinal({ precio: 39990, descuento: 20 })).toBe(31992);
  });

  it('formatearPrecio muestra pesos chilenos sin decimales', () => {
    const texto = formatearPrecio(549990);
    expect(texto).toContain('$');
    expect(texto).toMatch(/549.990/);
    expect(texto).not.toContain(',');
  });
});
