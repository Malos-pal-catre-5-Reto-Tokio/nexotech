import { screen, fireEvent } from '@testing-library/react';
import FormProducto from './FormProducto.jsx';
import { renderizarConSesion, llamadas } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, PRODUCTOS_ADMIN, CATEGORIAS_DE_PRUEBA, USUARIO_ADMIN } from '../../testing/apiFalsa.js';

const LISTA = ['Lista de productos', <p key="l">Lista de productos</p>];
const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
const guardar = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

function instalar(extra = []) {
  return instalarApiFalsa([
    ...extra,
    ['productos.php?id=1', (url, op) => (op?.method === 'PUT' ? { id: 1 } : PRODUCTOS_ADMIN[0])],
    ['productos.php', (url, op) => (op?.method === 'POST' ? { id: 99 } : PRODUCTOS_ADMIN)],
    ['categorias.php', CATEGORIAS_DE_PRUEBA],
    ['auth.php', USUARIO_ADMIN],
  ]);
}

describe('FormProducto', () => {
  let api;
  afterEach(() => api.restaurar());

  it('con los campos vacíos muestra los errores y no envía nada', async () => {
    api = instalar();
    renderizarConSesion(<FormProducto />, { patron: '/admin/productos/nuevo', ruta: '/admin/productos/nuevo' });
    await screen.findByRole('heading', { name: 'Nuevo producto' });

    guardar();

    expect(screen.getByText('El código es obligatorio.')).toBeTruthy();
    expect(screen.getByText('Selecciona una categoría.')).toBeTruthy();
    expect(llamadas(api, 'productos.php', 'POST').length).toBe(0);
  });

  it('un producto válido se envía por POST con los números convertidos y vuelve al listado', async () => {
    api = instalar();
    renderizarConSesion(<FormProducto />, {
      patron: '/admin/productos/nuevo', ruta: '/admin/productos/nuevo', extra: [['/admin/productos', LISTA[1]]],
    });
    await screen.findByRole('option', { name: 'Accesorios' });

    escribir(/^Código/, 'AC-009');
    escribir(/^Nombre/, 'Webcam');
    escribir(/^Precio/, '19990');
    escribir(/^Stock \*/, '5');
    escribir(/^Categoría/, '3');
    guardar();

    expect(await screen.findByText('Lista de productos')).toBeTruthy();
    expect(llamadas(api, 'productos.php', 'POST')[0].cuerpo).toEqual({
      codigo: 'AC-009', nombre: 'Webcam', descripcion: '', precio: 19990, stock: 5, stockCritico: 0,
      descuento: 0, imagen: '', categoriaId: 3,
    });
  });

  it('al editar carga los datos del producto y los guarda con PUT', async () => {
    api = instalar();
    renderizarConSesion(<FormProducto />, {
      patron: '/admin/productos/:id/editar', ruta: '/admin/productos/1/editar', extra: [['/admin/productos', LISTA[1]]],
    });

    expect(await screen.findByDisplayValue('Mouse ErgoTech')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Editar producto' })).toBeTruthy();
    escribir(/^Nombre/, 'Mouse ErgoTech V2');
    guardar();

    expect(await screen.findByText('Lista de productos')).toBeTruthy();
    const put = llamadas(api, 'productos.php?id=1', 'PUT')[0];
    expect(put.cuerpo.nombre).toBe('Mouse ErgoTech V2');
    expect(put.cuerpo.precio).toBe(10000);
  });

  it('rechaza un descuento mayor a 90', async () => {
    api = instalar();
    renderizarConSesion(<FormProducto />, { patron: '/admin/productos/nuevo', ruta: '/admin/productos/nuevo' });
    await screen.findByRole('heading', { name: 'Nuevo producto' });

    escribir(/^Descuento/, '95');
    guardar();

    expect(screen.getByText('Debe ser un entero entre 0 y 90.')).toBeTruthy();
  });

  it('si la API responde con un error (código repetido) lo muestra y no sale del formulario', async () => {
    api = instalar([['productos.php', new Error('Ya existe un producto con ese código.')]]);
    renderizarConSesion(<FormProducto />, { patron: '/admin/productos/nuevo', ruta: '/admin/productos/nuevo' });
    await screen.findByRole('option', { name: 'Accesorios' });

    escribir(/^Código/, 'AC-001');
    escribir(/^Nombre/, 'Repetido');
    escribir(/^Precio/, '100');
    escribir(/^Stock \*/, '1');
    escribir(/^Categoría/, '3');
    guardar();

    expect(await screen.findByText('Ya existe un producto con ese código.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nuevo producto' })).toBeTruthy();
  });
});
