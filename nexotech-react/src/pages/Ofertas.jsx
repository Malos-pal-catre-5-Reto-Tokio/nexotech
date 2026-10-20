import { Alert, Spinner } from 'react-bootstrap';
import ListaProductos from '../components/productos/ListaProductos.jsx';
import AvisoCarrito from '../components/productos/AvisoCarrito.jsx';
import { useProductos } from '../hooks/useProductos.js';
import { useAgregarAlCarrito } from '../hooks/useAgregarAlCarrito.js';

function Ofertas() {
  const { productos, cargando, error } = useProductos({ oferta: true });
  const { aviso, agregarProducto, cerrarAviso } = useAgregarAlCarrito();

  return (
    <section>
      <h1 className="h3 mb-3">Ofertas</h1>
      <AvisoCarrito aviso={aviso} onCerrar={cerrarAviso} />
      {error && <Alert variant="danger">No se pudo cargar el catálogo: {error}</Alert>}
      {cargando ? <Spinner animation="border" /> : (
        !error && (productos.length > 0
          ? <ListaProductos productos={productos} onAgregar={agregarProducto} />
          : <p className="text-muted">Por ahora no hay productos en oferta.</p>)
      )}
    </section>
  );
}

export default Ofertas;
