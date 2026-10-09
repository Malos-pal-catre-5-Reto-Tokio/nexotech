
const CARRITO_KEY = 'nexotech_carrito';
const CUPON_KEY = 'nexotech_cupon';
const CUPONES = { NEXO10: 0.1 };

function obtenerCarrito() {
  try {
    const data = JSON.parse(localStorage.getItem(CARRITO_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function obtenerCupon() {
  const codigo = localStorage.getItem(CUPON_KEY);
  return codigo && CUPONES[codigo] ? codigo : null;
}

function formatearMoneda(valor) {
  return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function mostrarAviso(mensaje, tipo = 'ok') {
  let aviso = document.getElementById('toast');
  if (!aviso) {
    aviso = document.createElement('div');
    aviso.id = 'toast';
    aviso.className = 'toast';
    aviso.setAttribute('role', 'status');
    document.body.appendChild(aviso);
  }
  aviso.textContent = mensaje;
  aviso.className = `toast toast--${tipo} toast--visible`;
  clearTimeout(mostrarAviso.timer);
  mostrarAviso.timer = setTimeout(() => aviso.classList.remove('toast--visible'), 2800);
}

function agregarAlCarrito(producto, cantidad, opciones = {}) {
  const carrito = obtenerCarrito();
  const itemExistente = carrito.find((item) => item.id === producto.id);
  const enCarrito = itemExistente ? itemExistente.cantidad : 0;

  if (enCarrito + cantidad > producto.stock) {
    const disponibles = producto.stock - enCarrito;
    mostrarAviso(
      disponibles > 0
        ? `Solo puedes añadir ${disponibles} unidad(es) más de este producto.`
        : 'Ya tienes todo el stock disponible en tu carrito.',
      'error'
    );
    return false;
  }

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      stock: producto.stock,
      cantidad,
    });
  }

  guardarCarrito(carrito);
  if (!opciones.silencioso) mostrarAviso(`${producto.nombre} añadido al carrito.`);
  return true;
}

function actualizarCantidadCarrito(id, nuevaCantidad) {
  let carrito = obtenerCarrito();
  const item = carrito.find((i) => i.id === id);
  if (!item) return;

  if (nuevaCantidad <= 0) {
    carrito = carrito.filter((i) => i.id !== id);
  } else if (item.stock && nuevaCantidad > item.stock) {
    mostrarAviso(`Stock máximo disponible: ${item.stock}.`, 'error');
    return;
  } else {
    item.cantidad = nuevaCantidad;
  }
  guardarCarrito(carrito);
  renderizarCarrito();
}

function actualizarContadorCarrito() {
  const contadorEl = document.getElementById('cart-count');
  if (!contadorEl) return;
  const totalItems = obtenerCarrito().reduce((acc, item) => acc + item.cantidad, 0);
  contadorEl.textContent = totalItems;
}

function renderizarCarrito() {
  const contenedor = document.getElementById('cart-items');
  if (!contenedor) return;

  const carrito = obtenerCarrito();
  const mensajeVacio = document.getElementById('cart-empty-msg');
  const descuentoFila = document.getElementById('cart-discount-row');

  contenedor.innerHTML = '';

  if (carrito.length === 0) {
    mensajeVacio.innerHTML = 'Tu carrito está vacío. <a href="productos.html">Ver productos</a>';
    contenedor.appendChild(mensajeVacio);
    document.getElementById('cart-subtotal').textContent = formatearMoneda(0);
    document.getElementById('cart-total').textContent = formatearMoneda(0);
    descuentoFila.hidden = true;
    return;
  }

  let subtotal = 0;

  carrito.forEach((item) => {
    subtotal += item.precio * item.cantidad;

    const fila = document.createElement('div');
    fila.className = 'cart-item';
    fila.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="cart-item__info">
        <a href="detalle-producto.html?id=${item.id}">${item.nombre}</a>
        <span>${formatearMoneda(item.precio)} c/u</span>
        <button class="btn-eliminar" data-id="${item.id}">Eliminar</button>
      </div>
      <div class="cart-item__cantidad">
        <button class="btn-restar" data-id="${item.id}" aria-label="Restar una unidad">−</button>
        <span>${item.cantidad}</span>
        <button class="btn-sumar" data-id="${item.id}" aria-label="Sumar una unidad">+</button>
      </div>
      <strong class="cart-item__subtotal">${formatearMoneda(item.precio * item.cantidad)}</strong>
    `;
    contenedor.appendChild(fila);
  });

  const cupon = obtenerCupon();
  const descuento = cupon ? Math.round(subtotal * CUPONES[cupon]) : 0;

  document.getElementById('cart-subtotal').textContent = formatearMoneda(subtotal);
  descuentoFila.hidden = descuento === 0;
  document.getElementById('cart-discount').textContent = `-${formatearMoneda(descuento)}`;
  document.getElementById('cart-total').textContent = formatearMoneda(subtotal - descuento);

  const cambiar = (btn, delta) => {
    const id = Number(btn.dataset.id);
    const item = obtenerCarrito().find((i) => i.id === id);
    if (item) actualizarCantidadCarrito(id, item.cantidad + delta);
  };
  contenedor.querySelectorAll('.btn-sumar').forEach((btn) => btn.addEventListener('click', () => cambiar(btn, 1)));
  contenedor.querySelectorAll('.btn-restar').forEach((btn) => btn.addEventListener('click', () => cambiar(btn, -1)));
  contenedor.querySelectorAll('.btn-eliminar').forEach((btn) =>
    btn.addEventListener('click', () => actualizarCantidadCarrito(Number(btn.dataset.id), 0))
  );
}

const btnCupon = document.getElementById('btn-aplicar-cupon');

if (btnCupon) {
  btnCupon.addEventListener('click', () => {
    const input = document.getElementById('cupon');
    const codigo = input.value.trim().toUpperCase();
    if (CUPONES[codigo]) {
      localStorage.setItem(CUPON_KEY, codigo);
      mostrarAviso(`Cupón ${codigo} aplicado: ${CUPONES[codigo] * 100}% de descuento.`);
      renderizarCarrito();
    } else {
      mostrarAviso('Cupón inválido.', 'error');
    }
  });
}

const btnPagar = document.getElementById('btn-pagar');

if (btnPagar) {
  btnPagar.addEventListener('click', () => {
    if (obtenerCarrito().length === 0) {
      mostrarAviso('Tu carrito está vacío.', 'error');
      return;
    }
    mostrarAviso('Compra simulada realizada con éxito.');
    localStorage.removeItem(CUPON_KEY);
    guardarCarrito([]);
    renderizarCarrito();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarContadorCarrito();
  renderizarCarrito();
});
