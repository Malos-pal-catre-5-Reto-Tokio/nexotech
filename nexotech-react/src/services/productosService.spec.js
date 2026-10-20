import {
  listarProductos, crearProducto, obtenerProducto, eliminarProducto,
} from './productosService.js';

// Mock de fetch: ninguna prueba toca la red ni el PHP real.
// Se reemplaza window.fetch por un espía y se restaura al terminar cada prueba.
let fetchOriginal;
let espiaFetch;

function simularRespuesta(cuerpo, ok = true, status = 200) {
  espiaFetch.and.resolveTo({ ok, status, json: async () => cuerpo });
  return espiaFetch;
}

describe('productosService', () => {
  beforeEach(() => {
    fetchOriginal = window.fetch;
    espiaFetch = jasmine.createSpy('fetch');
    window.fetch = espiaFetch;
  });

  afterEach(() => {
    window.fetch = fetchOriginal;
  });

  it('listarProductos sin filtros llama a productos.php y devuelve el arreglo', async () => {
    const espia = simularRespuesta([{ id: 1, nombre: 'Mouse' }]);

    const productos = await listarProductos();

    expect(espia.calls.mostRecent().args[0]).toBe('/api/productos.php');
    expect(productos.length).toBe(1);
    expect(productos[0].nombre).toBe('Mouse');
  });

  it('listarProductos arma la consulta con los filtros y omite los vacíos', async () => {
    const espia = simularRespuesta([]);

    await listarProductos({ categoria: 'notebooks', oferta: true, q: '', critico: false });

    const url = espia.calls.mostRecent().args[0];
    expect(url).toContain('categoria=notebooks');
    expect(url).toContain('oferta=1');
    expect(url).not.toContain('q=');
    expect(url).not.toContain('critico');
  });

  it('obtenerProducto pide el producto por id', async () => {
    const espia = simularRespuesta({ id: 7 });

    await obtenerProducto(7);

    expect(espia.calls.mostRecent().args[0]).toBe('/api/productos.php?id=7');
  });

  it('crearProducto envía un POST con el producto en JSON', async () => {
    const espia = simularRespuesta({ id: 11 }, true, 201);
    const nuevo = { codigo: 'AC-009', nombre: 'Webcam', precio: 19990 };

    await crearProducto(nuevo);

    const opciones = espia.calls.mostRecent().args[1];
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual(nuevo);
  });

  it('eliminarProducto envía un DELETE', async () => {
    const espia = simularRespuesta({ eliminado: 3 });

    await eliminarProducto(3);

    expect(espia.calls.mostRecent().args[1].method).toBe('DELETE');
  });

  it('lanza un error con el mensaje de la API cuando la respuesta no es exitosa', async () => {
    simularRespuesta({ error: 'Producto no encontrado.' }, false, 404);

    await expectAsync(obtenerProducto(999)).toBeRejectedWithError('Producto no encontrado.');
  });
});
