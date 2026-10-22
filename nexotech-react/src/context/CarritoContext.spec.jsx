import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarritoProvider, useCarrito } from './CarritoContext.jsx';

const mouse = { id: 1, nombre: 'Mouse', precio: 10000, descuento: 0, stock: 2, imagen: '' };

// Componente mínimo que consume el contexto para poder probarlo.
function Panel({ producto = mouse }) {
  const carrito = useCarrito();
  const [aviso, setAviso] = useState('');
  return (
    <div>
      <button onClick={() => setAviso(carrito.agregar(producto, 1).mensaje)}>agregar</button>
      <button onClick={() => carrito.aplicarCupon('nexo10')}>cupon</button>
      <span data-testid="total">{carrito.total}</span>
      <span data-testid="cantidad">{carrito.cantidadTotal}</span>
      <p role="status">{aviso}</p>
    </div>
  );
}

function renderizar(producto) {
  return render(<CarritoProvider><Panel producto={producto} /></CarritoProvider>);
}

const texto = (id) => screen.getByTestId(id).textContent;

describe('CarritoContext', () => {
  beforeEach(() => localStorage.clear());

  it('agregar un producto actualiza la cantidad y el total', () => {
    renderizar();

    fireEvent.click(screen.getByText('agregar'));

    expect(texto('cantidad')).toBe('1');
    expect(texto('total')).toBe('10000');
  });

  it('no permite superar el stock disponible y avisa al usuario', () => {
    renderizar();
    const boton = screen.getByText('agregar');

    fireEvent.click(boton);
    fireEvent.click(boton);
    fireEvent.click(boton); // el stock es 2, este intento debe rechazarse

    expect(texto('cantidad')).toBe('2');
    expect(screen.getByRole('status').textContent).toContain('stock disponible');
  });

  it('usa el precio con descuento de oferta', () => {
    renderizar({ ...mouse, descuento: 20 });

    fireEvent.click(screen.getByText('agregar'));

    expect(texto('total')).toBe('8000');
  });

  it('el cupón NEXO10 descuenta un 10% del subtotal', () => {
    renderizar();

    fireEvent.click(screen.getByText('agregar'));
    fireEvent.click(screen.getByText('cupon'));

    expect(texto('total')).toBe('9000');
  });

  it('guarda el carrito en localStorage (mock de setItem)', () => {
    const espia = spyOn(Storage.prototype, 'setItem').and.callThrough();
    renderizar();

    fireEvent.click(screen.getByText('agregar'));

    expect(espia).toHaveBeenCalledWith('nexotech_carrito', jasmine.any(String));
  });

  it('recupera el carrito guardado al iniciar', () => {
    localStorage.setItem('nexotech_carrito', JSON.stringify([
      { id: 5, nombre: 'Teclado', precio: 5000, stock: 9, cantidad: 3 },
    ]));

    renderizar();

    expect(texto('cantidad')).toBe('3');
    expect(texto('total')).toBe('15000');
  });

  it('useCarrito lanza un error si se usa fuera del proveedor', () => {
    spyOn(console, 'error'); // React registra el error en consola; se silencia en la prueba
    expect(() => render(<Panel />)).toThrowError(/CarritoProvider/);
  });

  it('si el carrito guardado está dañado, empieza vacío en vez de fallar', () => {
    localStorage.setItem('nexotech_carrito', '{esto no es json');
    localStorage.setItem('nexotech_cupon', 'CUPON-INEXISTENTE');

    renderizar();

    expect(texto('cantidad')).toBe('0');
    expect(texto('total')).toBe('0');
  });

  it('si el almacenamiento del navegador no está disponible, el carrito funciona en memoria', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('almacenamiento bloqueado');
    spyOn(Storage.prototype, 'setItem').and.throwError('almacenamiento bloqueado');

    renderizar();
    fireEvent.click(screen.getByText('agregar'));

    expect(texto('cantidad')).toBe('1');
  });
});
