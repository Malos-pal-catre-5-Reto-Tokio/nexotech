import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';
import DetalleOrden from '../components/checkout/DetalleOrden.jsx';
import { useOrden } from '../hooks/useOrden.js';
import { reintentarPago } from '../services/ordenesService.js';
import { useCarrito } from '../context/CarritoContext.jsx';

function CompraError() {
  const { id } = useParams();
  const { orden, cargando, error } = useOrden(id);
  const { vaciar } = useCarrito();
  const navegar = useNavigate();
  const [reintentando, setReintentando] = useState(false);
  const [errorReintento, setErrorReintento] = useState(null);

  if (cargando) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const reintentar = async () => {
    setReintentando(true);
    setErrorReintento(null);
    try {
      await reintentarPago(orden.id);
      vaciar();
      navegar(`/compra/exitosa/${orden.id}`);
    } catch (e) {
      setErrorReintento(e.message);
      setReintentando(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        <h1 className="h4 text-danger">
          <i className="bi bi-x-circle me-2" />No se pudo realizar el pago. nro #{orden.id}
        </h1>
        {errorReintento && <Alert variant="danger">{errorReintento}</Alert>}
        <div className="my-3">
          <Button variant="success" onClick={reintentar} disabled={reintentando}>
            {reintentando ? 'Procesando...' : 'VOLVER A REALIZAR EL PAGO'}
          </Button>
          <Link to="/carrito" className="btn btn-link">Volver al carrito</Link>
        </div>
        <DetalleOrden orden={orden} />
      </Card.Body>
    </Card>
  );
}

export default CompraError;
