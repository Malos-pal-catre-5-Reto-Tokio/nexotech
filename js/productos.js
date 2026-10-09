
const PRODUCTOS = [
  { id: 1, nombre: 'Notebook UltraSlim 14"', precio: 549990, stock: 12, stockCritico: 3, categoria: 'notebooks', descripcion: 'Notebook liviano con procesador de última generación, ideal para trabajo y estudio.', imagen: '../img/productos/notebook-1.jpg' },
  { id: 2, nombre: 'Notebook Gamer RX15', precio: 899990, stock: 5, stockCritico: 2, categoria: 'notebooks', descripcion: 'Notebook gamer con tarjeta gráfica dedicada y pantalla de alta tasa de refresco.', imagen: '../img/productos/notebook-2.jpg' },
  { id: 3, nombre: 'Smartphone Nova X20', precio: 349990, stock: 20, stockCritico: 5, categoria: 'celulares', descripcion: 'Smartphone con cámara triple y batería de larga duración.', imagen: '../img/productos/celular-1.jpg' },
  { id: 4, nombre: 'Smartphone Nova X20 Pro', precio: 499990, stock: 8, stockCritico: 3, categoria: 'celulares', descripcion: 'Versión Pro con más almacenamiento y pantalla AMOLED.', imagen: '../img/productos/celular-2.jpg' },
  { id: 5, nombre: 'Mouse inalámbrico ErgoTech', precio: 14990, stock: 40, stockCritico: 10, categoria: 'accesorios', descripcion: 'Mouse ergonómico inalámbrico con sensor de alta precisión.', imagen: '../img/productos/mouse.jpg' },
  { id: 6, nombre: 'Teclado mecánico ProType', precio: 39990, stock: 15, stockCritico: 4, categoria: 'accesorios', descripcion: 'Teclado mecánico retroiluminado con switches táctiles.', imagen: '../img/productos/teclado.jpg' },
  { id: 7, nombre: 'Audífonos SoundMax', precio: 29990, stock: 25, stockCritico: 6, categoria: 'accesorios', descripcion: 'Audífonos inalámbricos con cancelación de ruido.', imagen: '../img/productos/audifonos.jpg' },
  { id: 8, nombre: 'SSD 1TB SpeedDrive', precio: 59990, stock: 18, stockCritico: 5, categoria: 'componentes', descripcion: 'Disco de estado sólido NVMe de alta velocidad.', imagen: '../img/productos/ssd.jpg' },
  { id: 9, nombre: 'Memoria RAM 16GB DDR4', precio: 44990, stock: 22, stockCritico: 5, categoria: 'componentes', descripcion: 'Memoria RAM de alto rendimiento para gaming y trabajo pesado.', imagen: '../img/productos/ram.jpg' },
  { id: 10, nombre: 'Fuente de poder 650W', precio: 54990, stock: 2, stockCritico: 3, categoria: 'componentes', descripcion: 'Fuente de poder certificada 80+ Bronze, 650W.', imagen: '../img/productos/fuente.jpg' },
];

function formatearPrecio(valor) {
  return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function crearTarjetaProducto(producto) {
  const card = document.createElement('a');
  card.href = `detalle-producto.html?id=${producto.id}`;
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}">
    <p class="product-card__nombre">${producto.nombre}</p>
    <p class="product-card__precio">${formatearPrecio(producto.precio)}</p>
  `;
  return card;
}

function renderizarListaProductos(contenedorId, productos) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  contenedor.innerHTML = '';
  productos.forEach((producto) => contenedor.appendChild(crearTarjetaProducto(producto)));
}

if (document.getElementById('product-list') && !document.getElementById('filtro-categoria')) {
  renderizarListaProductos('product-list', PRODUCTOS.slice(0, 4));
}

const filtroCategoria = document.getElementById('filtro-categoria');

if (filtroCategoria) {
  renderizarListaProductos('product-list', PRODUCTOS);

  filtroCategoria.addEventListener('change', () => {
    const categoria = filtroCategoria.value;
    const productosFiltrados = categoria === 'todas'
      ? PRODUCTOS
      : PRODUCTOS.filter((p) => p.categoria === categoria);
    renderizarListaProductos('product-list', productosFiltrados);
  });
}

const nombreEl = document.getElementById('producto-nombre');

if (nombreEl) {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const producto = PRODUCTOS.find((p) => p.id === id);

  if (!producto) {
    document.querySelector('.product-detail__content').innerHTML =
      '<p>El producto que buscas no existe. <a href="productos.html">Volver al catálogo</a></p>';
    document.getElementById('seccion-relacionados').hidden = true;
  } else {
    document.title = `${producto.nombre} - NexoTech`;
    document.getElementById('breadcrumb-nombre').textContent = producto.nombre;
    nombreEl.textContent = producto.nombre;
    document.getElementById('producto-categoria').textContent = producto.categoria;
    document.getElementById('producto-precio').textContent = formatearPrecio(producto.precio);
    document.getElementById('producto-descripcion').textContent = producto.descripcion;
    document.getElementById('producto-imagen-principal').src = producto.imagen;
    document.getElementById('producto-imagen-principal').alt = producto.nombre;

    const stockEstadoEl = document.getElementById('stock-estado');
    const stockAlertaEl = document.getElementById('stock-alerta');
    const cantidadEl = document.getElementById('cantidad');
    const btnAgregar = document.getElementById('btn-agregar-carrito');
    const btnComprar = document.getElementById('btn-comprar-ahora');

    if (producto.stock <= 0) {
      stockEstadoEl.textContent = 'Sin stock';
      stockEstadoEl.classList.add('stock-estado--agotado');
      cantidadEl.disabled = true;
      btnAgregar.disabled = true;
      btnComprar.disabled = true;
    } else {
      stockEstadoEl.textContent = 'En stock';
      stockEstadoEl.classList.add('stock-estado--disponible');
      cantidadEl.max = producto.stock;
      if (producto.stock <= producto.stockCritico) {
        stockAlertaEl.textContent = `¡Quedan pocas unidades! Stock disponible: ${producto.stock}`;
      }
    }

    function leerCantidad() {
      const cantidad = Math.floor(Number(cantidadEl.value));
      if (!Number.isFinite(cantidad) || cantidad < 1) return 1;
      return Math.min(cantidad, producto.stock);
    }

    cantidadEl.addEventListener('change', () => {
      cantidadEl.value = leerCantidad();
    });

    btnAgregar.addEventListener('click', () => {
      agregarAlCarrito(producto, leerCantidad());
    });

    btnComprar.addEventListener('click', () => {
      if (agregarAlCarrito(producto, leerCantidad(), { silencioso: true })) {
        window.location.href = 'carrito.html';
      }
    });

    const relacionados = PRODUCTOS.filter((p) => p.categoria === producto.categoria && p.id !== producto.id).slice(0, 5);
    renderizarListaProductos('related-product-list', relacionados);
  }
}
