import { createContext, useContext, useEffect, useState } from 'react';
import { precioFinal } from '../utils/precios.js';

// Mismas claves y cupón que el carrito de la Evaluación Parcial 1.
const CARRITO_KEY = 'nexotech_carrito';
const CUPON_KEY = 'nexotech_cupon';
const CUPONES = { NEXO10: 0.1 };

const CarritoContext = createContext(null);

function leerCarritoGuardado() {
  try {
    const datos = JSON.parse(localStorage.getItem(CARRITO_KEY));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function leerCuponGuardado() {
  try {
    const codigo = localStorage.getItem(CUPON_KEY);
    return codigo && CUPONES[codigo] ? codigo : null;
  } catch {
    return null;
  }
}

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(leerCarritoGuardado);
  const [cupon, setCupon] = useState(leerCuponGuardado);

  // Persistencia: cada cambio del estado se refleja en localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
      if (cupon) localStorage.setItem(CUPON_KEY, cupon);
      else localStorage.removeItem(CUPON_KEY);
    } catch {
      // Si el almacenamiento no está disponible, el carrito sigue funcionando en memoria.
    }
  }, [items, cupon]);

  // Devuelve { ok, mensaje } para que la vista decida cómo avisar al usuario.
  const agregar = (producto, cantidad = 1) => {
    const existente = items.find((item) => item.id === producto.id);
    const enCarrito = existente ? existente.cantidad : 0;

    if (enCarrito + cantidad > producto.stock) {
      const disponibles = producto.stock - enCarrito;
      return {
        ok: false,
        mensaje: disponibles > 0
          ? `Solo puedes añadir ${disponibles} unidad(es) más de este producto.`
          : 'Ya tienes todo el stock disponible en tu carrito.',
      };
    }

    if (existente) {
      setItems(items.map((item) =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item));
    } else {
      setItems([...items, {
        id: producto.id,
        nombre: producto.nombre,
        imagen: producto.imagen,
        precio: precioFinal(producto),
        stock: producto.stock,
        cantidad,
      }]);
    }
    return { ok: true, mensaje: 'Producto añadido al carrito.' };
  };

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      setItems(items.filter((item) => item.id !== id));
      return;
    }
    setItems(items.map((item) =>
      item.id === id ? { ...item, cantidad: Math.min(cantidad, item.stock) } : item));
  };

  const quitar = (id) => setItems(items.filter((item) => item.id !== id));
  const vaciar = () => { setItems([]); setCupon(null); };

  const aplicarCupon = (codigo) => {
    const limpio = codigo.trim().toUpperCase();
    if (!CUPONES[limpio]) return false;
    setCupon(limpio);
    return true;
  };

  const subtotal = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const descuento = cupon ? Math.round(subtotal * CUPONES[cupon]) : 0;
  const total = subtotal - descuento;
  const cantidadTotal = items.reduce((suma, item) => suma + item.cantidad, 0);

  const valor = {
    items, cupon, subtotal, descuento, total, cantidadTotal,
    agregar, cambiarCantidad, quitar, vaciar, aplicarCupon,
  };

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  return contexto;
}
