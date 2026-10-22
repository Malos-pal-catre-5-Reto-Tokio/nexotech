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

// ---- Datos de prueba del panel de administración ----
const PERSONA = { apellidos: 'Prueba', run: '19011022K', region: 'Región Metropolitana de Santiago', comuna: 'Santiago', direccion: 'Av. Siempre Viva 123' };
export const USUARIO_ADMIN = { ...PERSONA, id: 1, nombre: 'Admin', correo: 'admin@duoc.cl', rol: 'admin' };
export const USUARIO_VENDEDOR = { ...PERSONA, id: 2, nombre: 'Vera', correo: 'vendedor@duoc.cl', rol: 'vendedor' };
export const USUARIO_CLIENTE = { ...PERSONA, id: 3, nombre: 'Pedro', correo: 'cliente@gmail.com', rol: 'cliente', run: '21345678K' };

export const PRODUCTOS_ADMIN = [
  { id: 1, codigo: 'AC-001', nombre: 'Mouse ErgoTech', descripcion: 'Mouse', precio: 10000, stock: 2, stockCritico: 3, descuento: 0, imagen: '/img/m.jpg', categoria: 'accesorios', categoriaId: 3 },
  { id: 2, codigo: 'AC-002', nombre: 'Teclado ProType', descripcion: 'Teclado', precio: 40000, stock: 10, stockCritico: 4, descuento: 20, imagen: '/img/t.jpg', categoria: 'accesorios', categoriaId: 3 },
];

export const ORDENES_DE_PRUEBA = [
  { id: 8, codigo: 'ORD-000008', usuarioId: 3, nombre: 'Pedro', apellidos: 'Cliente', correo: 'cliente@gmail.com', total: 20000, estado: 'pagada', creadoEn: '2026-10-19 21:30:00' },
  { id: 7, codigo: 'ORD-000007', usuarioId: null, nombre: 'Ana', apellidos: 'Invitada', correo: 'ana@gmail.com', total: 5000, estado: 'fallida', creadoEn: '2026-10-18 10:00:00' },
];

export const REPORTES_DE_PRUEBA = {
  resumen: { ordenesPagadas: 12, ordenesFallidas: 2, ingresos: 350000, productos: 10, unidadesInventario: 150, productosCriticos: 2, usuarios: 5, usuariosNuevosMes: 1 },
  masVendidos: [{ nombre: 'Mouse ErgoTech', unidades: 7, ingresos: 70000 }],
  stockPorCategoria: [{ nombre: 'Accesorios', productos: 3, unidades: 80 }],
  ordenesPorEstado: [{ estado: 'pagada', cantidad: 12, total: 350000 }, { estado: 'fallida', cantidad: 2, total: 20000 }],
  ventasPorDia: [{ dia: '2026-10-19', ordenes: 3, total: 90000 }],
};
