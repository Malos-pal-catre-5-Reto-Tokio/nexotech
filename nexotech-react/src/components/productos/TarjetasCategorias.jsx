import { Link } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';

// Fila de tarjetas de categorías; resalta la que está seleccionada.
function TarjetasCategorias({ categorias, seleccionada }) {
  return (
    <Row xs={2} md={4} className="g-3 mb-4 justify-content-center">
      {categorias.map((categoria) => {
        const activa = categoria.slug === seleccionada;
        return (
          <Col key={categoria.id}>
            <Card
              as={Link}
              to={`/categorias/${categoria.slug}`}
              className={`h-100 text-center text-decoration-none shadow-sm ${activa ? 'border-primary border-2' : ''}`}
              aria-current={activa ? 'page' : undefined}
            >
              <Card.Body>
                <i className="bi bi-tag fs-1 text-primary" aria-hidden="true" />
                <span className="d-block fw-semibold mt-2 text-dark">{categoria.nombre}</span>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default TarjetasCategorias;
