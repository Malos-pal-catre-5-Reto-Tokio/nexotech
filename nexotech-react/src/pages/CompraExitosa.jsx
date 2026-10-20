import { Link, useParams } from 'react-router-dom';
import { Alert, Card, Spinner } from 'react-bootstrap';
import DetalleOrden from '../components/checkout/DetalleOrden.jsx';
import { useOrden } from '../hooks/useOrden.js';

function CompraExitosa() {
  const { id } = useParams();
  const { orden, cargando, error } = useOrden(id);

  if (cargando) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card>
      <Card.Body>
        <p className="text-muted small text-end mb-1">Código orden: {orden.codigo}</p>
        <h1 className="h4 text-success">
          <i className="bi bi-check-circle me-2" />Se ha realizado la compra. nro #{orden.id}
        </h1>
        <DetalleOrden orden={orden} />
        <div className="text-end">
          <Link to="/productos" className="btn btn-outline-primary">Seguir comprando</Link>
        </div>
      </Card.Body>
    </Card>
  );
}

export default CompraExitosa;
