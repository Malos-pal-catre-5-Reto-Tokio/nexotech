import { useParams } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import TarjetasCategorias from '../components/productos/TarjetasCategorias.jsx';
import ListaProductos from '../components/productos/ListaProductos.jsx';
import AvisoCarrito from '../components/productos/AvisoCarrito.jsx';
import { useCategorias } from '../hooks/useCategorias.js';
import { useProductos } from '../hooks/useProductos.js';
import { useAgregarAlCarrito } from '../hooks/useAgregarAlCarrito.js';

// /categorias muestra todas las categorías y todos los productos;
// /categorias/:slug filtra por la categoría elegida.
function Categorias() {
  const { slug } = useParams();
  const categorias = useCategorias();
  const { productos, cargando, error } = useProductos(slug ? { categoria: slug } : {});
  const { aviso, agregarProducto, cerrarAviso } = useAgregarAlCarrito();

  const categoria = categorias.find((c) => c.slug === slug);
  const noExiste = slug && categorias.length > 0 && !categoria;
  const titulo = categoria ? categoria.nombre : 'Todos los productos';

  return (
    <section>
      <h1 className="h3 mb-3 text-center">Categorías</h1>
      <TarjetasCategorias categorias={categorias} seleccionada={slug} />

      {noExiste ? (
        <Alert variant="warning">La categoría “{slug}” no existe.</Alert>
      ) : (
        <>
          <h2 className="h4 mb-3">{titulo}</h2>
          <AvisoCarrito aviso={aviso} onCerrar={cerrarAviso} />
          {error && <Alert variant="danger">No se pudo cargar el catálogo: {error}</Alert>}
          {cargando ? <Spinner animation="border" /> : (
            !error && <ListaProductos productos={productos} onAgregar={agregarProducto} />
          )}
        </>
      )}
    </section>
  );
}

export default Categorias;
