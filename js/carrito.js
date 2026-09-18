
const CARRITO_KEY = 'nexotech_carrito';

function obtenerCarrito() {
  const data = localStorage.getItem(CARRITO_KEY);
  return data ? JSON.parse(data) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function agregarAlCarrito(producto, cantidad) {
  const carrito = obtenerCarrito();
  const itemExistente = carrito.find((item) => item.id === producto.id);

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad,
    });
  }

  guardarCarrito(carrito);
  alert(`${producto.nombre} añadido al carrito.`);
}

function actualizarCantidadCarrito(id, nuevaCantidad) {
  let carrito = obtenerCarrito();
  if (nuevaCantidad <= 0) {
    carrito = carrito.filter((item) => item.id !== id);
  } else {
    const item = carrito.find((i) => i.id === id);
    if (item) item.cantidad = nuevaCantidad;
  }
  guardarCarrito(carrito);
  renderizarCarrito();
}

function actualizarContadorCarrito() {
  const contadorEl = document.getElementById('cart-count');
  if (!contadorEl) return;
  const carrito = obtenerCarrito();
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  contadorEl.textContent = totalItems;
}

function formatearMoneda(valor) {
  return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function renderizarCarrito() {
  const contenedor = document.getElementById('cart-items');
  if (!contenedor) return;

  const carrito = obtenerCarrito();
  const mensajeVacio = document.getElementById('cart-empty-msg');

  contenedor.innerHTML = '';

  if (carrito.length === 0) {
    contenedor.appendChild(mensajeVacio);
    document.getElementById('cart-total').textContent = formatearMoneda(0);
    return;
  }

  let total = 0;

  carrito.forEach((item) => {
    total += item.precio * item.cantidad;

    const fila = document.createElement('div');
    fila.className = 'cart-item';
    fila.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}">
      <div class="cart-item__info">
        <p>${item.nombre}</p>
        <span>${formatearMoneda(item.precio)}</span>
      </div>
      <div class="cart-item__cantidad">
        <button class="btn-restar" data-id="${item.id}">−</button>
        <span>${item.cantidad}</span>
        <button class="btn-sumar" data-id="${item.id}">+</button>
      </div>
    `;
    contenedor.appendChild(fila);
  });

  document.getElementById('cart-total').textContent = formatearMoneda(total);

  contenedor.querySelectorAll('.btn-sumar').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const item = obtenerCarrito().find((i) => i.id === id);
      actualizarCantidadCarrito(id, item.cantidad + 1);
    });
  });

  contenedor.querySelectorAll('.btn-restar').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const item = obtenerCarrito().find((i) => i.id === id);
      actualizarCantidadCarrito(id, item.cantidad - 1);
    });
  });
}

const btnCupon = document.getElementById('btn-aplicar-cupon');

if (btnCupon) {
  btnCupon.addEventListener('click', () => {
    const codigo = document.getElementById('cupon').value.trim().toUpperCase();
    if (codigo === 'NEXO10') {
      alert('Cupón aplicado: 10% de descuento.');
    } else {
      alert('Cupón inválido.');
    }
  });
}

const btnPagar = document.getElementById('btn-pagar');

if (btnPagar) {
  btnPagar.addEventListener('click', () => {
    if (obtenerCarrito().length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }
    alert('Compra simulada realizada con éxito.');
    guardarCarrito([]);
    renderizarCarrito();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarContadorCarrito();
  renderizarCarrito();
});