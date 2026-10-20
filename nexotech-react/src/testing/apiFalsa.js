// Utilidad solo para pruebas: reemplaza window.fetch por un espía que responde sin red ni PHP.
// "rutas" es un arreglo de [fragmentoDeUrl, respuesta]; gana la primera que coincide.
// La respuesta puede ser un valor, una función(url, opciones) o un Error (simula respuesta 404 de la API).
export function instalarApiFalsa(rutas) {
  const fetchOriginal = window.fetch;

  const espia = jasmine.createSpy('fetch').and.callFake(async (url, opciones) => {
    const coincidencia = rutas.find(([fragmento]) => url.includes(fragmento));
    let datos = coincidencia ? coincidencia[1] : [];
    if (typeof datos === 'function') datos = datos(url, opciones);

    if (datos instanceof Error) {
      return { ok: false, status: 404, json: async () => ({ error: datos.message }) };
    }
    return { ok: true, status: 200, json: async () => datos };
  });

  window.fetch = espia;
  return { espia, restaurar: () => { window.fetch = fetchOriginal; } };
}

// Imagen mínima en base64 para que las pruebas no pidan archivos que no existen.
const IMAGEN_FALSA = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

export const PRODUCTOS_DE_PRUEBA = [
  { id: 1, nombre: 'Mouse ErgoTech', descripcion: 'Mouse ergonómico', precio: 10000, stock: 5, descuento: 0, imagen: IMAGEN_FALSA, categoria: 'accesorios', categoriaId: 3 },
  { id: 2, nombre: 'Teclado ProType', descripcion: 'Teclado mecánico', precio: 40000, stock: 3, descuento: 20, imagen: IMAGEN_FALSA, categoria: 'accesorios', categoriaId: 3 },
];

export const CATEGORIAS_DE_PRUEBA = [
  { id: 2, slug: 'celulares', nombre: 'Celulares' },
  { id: 3, slug: 'accesorios', nombre: 'Accesorios' },
];
