import { peticion } from './api.js';

describe('api.peticion', () => {
  let fetchOriginal;
  beforeEach(() => { fetchOriginal = window.fetch; });
  afterEach(() => { window.fetch = fetchOriginal; });

  it('anteponde el prefijo /api, envía JSON y devuelve los datos', async () => {
    window.fetch = jasmine.createSpy('fetch').and.resolveTo({ ok: true, status: 200, json: async () => ({ ok: 1 }) });

    const datos = await peticion('x.php', { metodo: 'POST', cuerpo: { a: 1 } });

    const [url, opciones] = window.fetch.calls.mostRecent().args;
    expect(url).toBe('/api/x.php');
    expect(opciones.method).toBe('POST');
    expect(opciones.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(opciones.body)).toEqual({ a: 1 });
    expect(datos).toEqual({ ok: 1 });
  });

  it('si el servidor no devuelve JSON (por ejemplo un 500 del PHP) lanza un error genérico con el código', async () => {
    window.fetch = jasmine.createSpy('fetch').and.resolveTo({
      ok: false, status: 500, json: async () => { throw new Error('no es json'); },
    });

    await expectAsync(peticion('x.php')).toBeRejectedWithError('Error 500 al llamar a x.php');
  });
});
