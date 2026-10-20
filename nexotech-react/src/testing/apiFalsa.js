// Utilidad solo para pruebas: reemplaza window.fetch por un espía que responde sin red ni PHP.
// "rutas" es un arreglo de [fragmentoDeUrl, respuesta]; gana la primera que coincide.
// La respuesta puede ser un valor, una función(url) o un Error (simula respuesta 404 de la API).
export function instalarApiFalsa(rutas) {
  const fetchOriginal = window.fetch;

  const espia = jasmine.createSpy('fetch').and.callFake(async (url) => {
    const coincidencia = rutas.find(([fragmento]) => url.includes(fragmento));
    let datos = coincidencia ? coincidencia[1] : [];
    if (typeof datos === 'function') datos = datos(url);

    if (datos instanceof Error) {
      return { ok: false, status: 404, json: async () => ({ error: datos.message }) };
    }
    return { ok: true, status: 200, json: async () => datos };
  });

  window.fetch = espia;
  return { espia, restaurar: () => { window.fetch = fetchOriginal; } };
}

export const PRODUCTOS_DE_PRUEBA = [
  { id: 1, nombre: 'Mouse ErgoTech', descripcion: 'Mouse ergonómico', precio: 10000, stock: 5, descuento: 0, imagen: '/img/m.jpg', categoria: 'accesorios', categoriaId: 3 },
  { id: 2, nombre: 'Teclado ProType', descripcion: 'Teclado mecánico', precio: 40000, stock: 3, descuento: 20, imagen: '/img/t.jpg', categoria: 'accesorios', categoriaId: 3 },
];

export const CATEGORIAS_DE_PRUEBA = [
  { id: 2, slug: 'celulares', nombre: 'Celulares' },
  { id: 3, slug: 'accesorios', nombre: 'Accesorios' },
];
