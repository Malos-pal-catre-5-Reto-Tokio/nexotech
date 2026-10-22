import { esPersonal, esAdmin } from './roles.js';
import { formatearFecha } from './formato.js';

describe('roles', () => {
  it('el administrador y el vendedor son personal; el cliente y la ausencia de sesión no', () => {
    expect(esPersonal({ rol: 'admin' })).toBeTrue();
    expect(esPersonal({ rol: 'vendedor' })).toBeTrue();
    expect(esPersonal({ rol: 'cliente' })).toBeFalse();
    expect(esPersonal(null)).toBeFalse();
  });

  it('solo el administrador es admin', () => {
    expect(esAdmin({ rol: 'admin' })).toBeTrue();
    expect(esAdmin({ rol: 'vendedor' })).toBeFalse();
  });
});

describe('formatearFecha', () => {
  it('convierte la fecha de MySQL en una fecha legible con el año', () => {
    expect(formatearFecha('2026-10-19 21:30:00')).toContain('2026');
  });

  it('devuelve vacío sin fecha y el texto original si no se puede interpretar', () => {
    expect(formatearFecha(null)).toBe('');
    expect(formatearFecha('no es fecha')).toBe('no es fecha');
  });
});
