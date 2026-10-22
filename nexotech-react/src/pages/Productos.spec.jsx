import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Productos from './Productos.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { instalarApiFalsa, PRODUCTOS_DE_PRUEBA, CATEGORIAS_DE_PRUEBA } from '../testing/apiFalsa.js';

function renderizar(ruta = '/productos') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <CarritoProvider>
        <Productos />
      </CarritoProvider>
    </MemoryRouter>
  );
}

describe('Productos (página)', () => {
  let api;
  beforeEach(() => localStorage.clear());
  afterEach(() => api.restaurar());

  it('carga y muestra los productos que entrega la API', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['productos.php', PRODUCTOS_DE_PRUEBA]]);

    renderizar();

    expect(await screen.findByText('Mouse ErgoTech')).toBeTruthy();
    expect(screen.getByText('Teclado ProType')).toBeTruthy();
  });

  it('al elegir una categoría vuelve a pedir los productos filtrados', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['productos.php', PRODUCTOS_DE_PRUEBA]]);
    renderizar();
    await screen.findByText('Mouse ErgoTech');

    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'celulares' } });

    await screen.findByText('Mouse ErgoTech');
    const urls = api.espia.calls.allArgs().map((argumentos) => argumentos[0]);
    expect(urls.some((url) => url.includes('categoria=celulares'))).toBeTrue();
  });

  it('usa el texto de búsqueda de la URL como filtro', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['productos.php', PRODUCTOS_DE_PRUEBA]]);

    renderizar('/productos?q=mouse');

    await screen.findByText('Mouse ErgoTech');
    expect(screen.getByLabelText('Buscar producto').value).toBe('mouse');
    const urls = api.espia.calls.allArgs().map((argumentos) => argumentos[0]);
    expect(urls.some((url) => url.includes('q=mouse'))).toBeTrue();
  });

  it('al añadir un producto muestra el aviso del carrito', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['productos.php', PRODUCTOS_DE_PRUEBA]]);
    renderizar();
    await screen.findByText('Mouse ErgoTech');

    fireEvent.click(screen.getAllByRole('button', { name: 'Añadir al carrito' })[0]);

    expect(screen.getByRole('status').textContent).toContain('Producto añadido al carrito.');
  });

  it('muestra un mensaje de error si la API falla', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['productos.php', new Error('Error de base de datos.')]]);

    renderizar();

    expect(await screen.findByText(/Error de base de datos/)).toBeTruthy();
  });

  it('al buscar por texto vuelve a pedir los productos con ese término', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['productos.php', PRODUCTOS_DE_PRUEBA]]);
    renderizar();
    await screen.findByText('Mouse ErgoTech');

    fireEvent.change(screen.getByLabelText('Buscar producto'), { target: { value: '  teclado ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await screen.findByText('Mouse ErgoTech');
    const urls = api.espia.calls.allArgs().map((argumentos) => argumentos[0]);
    expect(urls.some((url) => url.includes('q=teclado'))).toBeTrue(); // se recorta el espacio sobrante
  });

  it('al volver a "Todas las categorías" se quita el filtro de la consulta', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['productos.php', PRODUCTOS_DE_PRUEBA]]);
    renderizar('/productos?categoria=celulares');
    await screen.findByText('Mouse ErgoTech');
    await screen.findByRole('option', { name: 'Celulares' });

    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '' } });

    await screen.findByText('Mouse ErgoTech');
    const ultima = api.espia.calls.allArgs().map((argumentos) => argumentos[0]).filter((u) => u.includes('productos.php')).pop();
    expect(ultima).not.toContain('categoria=');
  });

  it('el aviso de "añadido al carrito" se puede cerrar', async () => {
    api = instalarApiFalsa([['categorias.php', CATEGORIAS_DE_PRUEBA], ['productos.php', PRODUCTOS_DE_PRUEBA]]);
    renderizar();
    await screen.findByText('Mouse ErgoTech');
    fireEvent.click(screen.getAllByRole('button', { name: 'Añadir al carrito' })[0]);
    expect(screen.getByRole('status')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByRole('status')).toBeNull();
  });
});
