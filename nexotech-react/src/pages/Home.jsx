import { Link } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import ListaProductos from '../components/productos/ListaProductos.jsx';
import AvisoCarrito from '../components/productos/AvisoCarrito.jsx';
import { useProductos } from '../hooks/useProductos.js';
import { useAgregarAlCarrito } from '../hooks/useAgregarAlCarrito.js';

function Home() {
  const { productos, cargando, error } = useProductos();
  const ofertas = useProductos({ oferta: true });
  const { aviso, agregarProducto, cerrarAviso } = useAgregarAlCarrito();

  return (
    <>
      <section className="text-center mb-4">
        <h1 className="h2 mb-3">Bienvenido a NexoTech</h1>
        <img src="/img/hero-banner.jpg" alt="Tecnología al mejor precio" className="img-fluid rounded mb-3" />
        <div>
          <Link to="/productos" className="btn btn-primary">Ver catálogo</Link>
        </div>
      </section>

      <AvisoCarrito aviso={aviso} onCerrar={cerrarAviso} />
      {error && <Alert variant="danger">No se pudo cargar el catálogo: {error}</Alert>}

      <section className="mb-4">
        <h2 className="h4">Ofertas</h2>
        {ofertas.cargando ? <Spinner animation="border" size="sm" /> : (
          <ListaProductos productos={ofertas.productos} onAgregar={agregarProducto} />
        )}
      </section>

      <section>
        <h2 className="h4">Destacados</h2>
        {cargando ? <Spinner animation="border" size="sm" /> : (
          <ListaProductos productos={productos.slice(0, 4)} onAgregar={agregarProducto} />
        )}
      </section>
    </>
  );
}

export default Home;
