import { Row, Col } from 'react-bootstrap';
import ProductoCard from './ProductoCard.jsx';

// Grilla responsiva: 1 columna en móvil, 2 en tablet, 4 en escritorio.
function ListaProductos({ productos, onAgregar }) {
  if (productos.length === 0) {
    return <p className="text-muted">No hay productos para mostrar.</p>;
  }

  return (
    <Row xs={1} sm={2} lg={4} className="g-3">
      {productos.map((producto) => (
        <Col key={producto.id}>
          <ProductoCard producto={producto} onAgregar={onAgregar} />
        </Col>
      ))}
    </Row>
  );
}

export default ListaProductos;
