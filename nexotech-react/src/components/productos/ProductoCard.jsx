import { Link } from 'react-router-dom';
import { Card, Badge, Button } from 'react-bootstrap';
import { precioFinal, formatearPrecio } from '../../utils/precios.js';

// Tarjeta de un producto. Recibe los datos y la acción por props (no conoce el carrito).
function ProductoCard({ producto, onAgregar }) {
  const enOferta = producto.descuento > 0;
  const sinStock = producto.stock === 0;

  return (
    <Card className="h-100 shadow-sm position-relative">
      {enOferta && (
        <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
          -{producto.descuento}%
        </Badge>
      )}
      <Link to={`/productos/${producto.id}`} tabIndex={-1} aria-hidden="true">
        <Card.Img
          variant="top"
          src={producto.imagen}
          alt={producto.nombre}
          className="p-3"
          style={{ objectFit: 'contain', height: 180 }}
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h2" className="h6">
          <Link to={`/productos/${producto.id}`} className="text-decoration-none text-dark">
            {producto.nombre}
          </Link>
        </Card.Title>
        <div className="mb-2">
          {enOferta && (
            <small className="text-muted text-decoration-line-through me-2">
              {formatearPrecio(producto.precio)}
            </small>
          )}
          <strong>{formatearPrecio(precioFinal(producto))}</strong>
        </div>
        {sinStock && <span className="text-danger small mb-2">Sin stock</span>}
        <Button
          className="mt-auto"
          size="sm"
          disabled={sinStock}
          onClick={() => onAgregar(producto)}
        >
          Añadir al carrito
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ProductoCard;
