import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Checkout from './Checkout.jsx';
import { CarritoProvider } from '../context/CarritoContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { instalarApiFalsa } from '../testing/apiFalsa.js';

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <AuthProvider>
        <CarritoProvider>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/compra/exitosa/:id" element={<p>Llegó a pago correcto</p>} />
            <Route path="/compra/error/:id" element={<p>Llegó a pago con error</p>} />
          </Routes>
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

function llenarFormulario() {
  const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
  escribir(/Nombre/, 'Pedro');
  escribir(/Apellidos/, 'Pérez');
  escribir(/Correo/, 'pedro@example.com');
  escribir(/^Calle/, 'Los Crisantemos 123');
  escribir(/Región/, 'Región de Tarapacá');
  escribir(/Comuna/, 'Iquique');
}

const pagar = () => fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }));
const carritoGuardado = () => JSON.parse(localStorage.getItem('nexotech_carrito'));

describe('Checkout (página)', () => {
  let api;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('nexotech_carrito', JSON.stringify([
      { id: 1, nombre: 'Mouse', precio: 10000, stock: 5, cantidad: 2, imagen: '' },
    ]));
    // La API falsa responde según el resultado de pago que pida el formulario.
    api = instalarApiFalsa([['ordenes.php', (url, opciones) => (
      JSON.parse(opciones.body).pago === 'rechazado'
        ? { id: 8, estado: 'fallida' }
        : { id: 7, estado: 'pagada' })]]);
  });

  afterEach(() => api.restaurar());

  it('con el carrito vacío no muestra el formulario', () => {
    localStorage.setItem('nexotech_carrito', '[]');

    renderizar();

    expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Pagar ahora/ })).toBeNull();
  });

  it('si faltan datos muestra los errores y no llama a la API', () => {
    renderizar();

    pagar();

    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('Selecciona una región.')).toBeTruthy();
    const llamadasAOrdenes = api.espia.calls.allArgs().filter(([url]) => url.includes('ordenes.php'));
    expect(llamadasAOrdenes.length).toBe(0);
  });

  it('al elegir una región se cargan solo las comunas de esa región', () => {
    renderizar();
    expect(screen.getByLabelText(/Comuna/).disabled).toBeTrue();

    fireEvent.change(screen.getByLabelText(/Región/), { target: { value: 'Región de Tarapacá' } });

    expect(screen.getByRole('option', { name: 'Iquique' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'Arica' })).toBeNull();
  });

  it('un pago exitoso envía la orden, vacía el carrito y va a la vista de compra exitosa', async () => {
    renderizar();
    llenarFormulario();

    pagar();

    expect(await screen.findByText('Llegó a pago correcto')).toBeTruthy();
    const cuerpo = JSON.parse(api.espia.calls.mostRecent().args[1].body);
    expect(cuerpo.items).toEqual([{ id: 1, cantidad: 2 }]);
    expect(cuerpo.pago).toBe('aprobado');
    expect(cuerpo.entrega.comuna).toBe('Iquique');
    expect(carritoGuardado()).toEqual([]);
  });

  it('un pago rechazado va a la vista de error y conserva el carrito', async () => {
    renderizar();
    llenarFormulario();
    fireEvent.click(screen.getByLabelText('Simular error en el pago'));

    pagar();

    expect(await screen.findByText('Llegó a pago con error')).toBeTruthy();
    expect(carritoGuardado().length).toBe(1);
  });

  it('muestra el mensaje de la API si la compra no se puede procesar', async () => {
    api.restaurar();
    api = instalarApiFalsa([['ordenes.php', new Error('Stock insuficiente para Mouse.')]]);
    renderizar();
    llenarFormulario();

    pagar();

    expect(await screen.findByText('Stock insuficiente para Mouse.')).toBeTruthy();
    expect(screen.queryByText('Llegó a pago correcto')).toBeNull();
  });

  it('con sesión iniciada completa solos los datos del cliente y la dirección', async () => {
    api.restaurar();
    api = instalarApiFalsa([['auth.php', {
      id: 3, nombre: 'Pedro', apellidos: 'Cliente', correo: 'cliente@gmail.com', rol: 'cliente',
      region: 'Región de Tarapacá', comuna: 'Iquique', direccion: 'Los Crisantemos 789',
    }]]);

    renderizar();

    expect(await screen.findByDisplayValue('Pedro')).toBeTruthy();
    expect(screen.getByLabelText(/Correo/).value).toBe('cliente@gmail.com');
    expect(screen.getByLabelText(/^Calle/).value).toBe('Los Crisantemos 789');
    expect(screen.getByLabelText(/Región/).value).toBe('Región de Tarapacá');
    expect(screen.getByLabelText(/Comuna/).value).toBe('Iquique');
  });

  it('se puede cambiar entre pago exitoso y simulación de error antes de pagar', async () => {
    renderizar();
    llenarFormulario();

    fireEvent.click(screen.getByLabelText('Simular error en el pago'));
    fireEvent.click(screen.getByLabelText('Pago exitoso'));
    pagar();

    expect(await screen.findByText('Llegó a pago correcto')).toBeTruthy();
    expect(JSON.parse(api.espia.calls.mostRecent().args[1].body).pago).toBe('aprobado');
  });
});
