import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import AvisoCarrito from '../components/productos/AvisoCarrito.jsx';
import { useProducto } from '../hooks/useProductos.js';
import { useAgregarAlCarrito } from '../hooks/useAgregarAlCarrito.js';
import { precioFinal, formatearPrecio } from '../utils/precios.js';

function DetalleProducto() {
  const { id } = useParams();
  const { producto, cargando, error } = useProducto(id);
  const { aviso, agregarProducto, cerrarAviso } = useAgregarAlCarrito();
  const [cantidad, setCantidad] = useState(1);

  if (cargando) return <Spinner animation="border" />;
  if (error) {
    return (
      <>
        <Alert variant="danger">{error}</Alert>
        <Link to="/productos">Volver al catálogo</Link>
      </>
    );
  }

  const enOferta = producto.descuento > 0;

  return (
    <Row className="g-4">
      <Col md={5}>
        <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded border p-3" />
      </Col>
      <Col md={7}>
        <h1 className="h3">{producto.nombre}</h1>
        <p className="text-muted">{producto.descripcion}</p>
        <p className="h4">
          {enOferta && (
            <small className="text-muted text-decoration-line-through me-2">
              {formatearPrecio(producto.precio)}
            </small>
          )}
          {formatearPrecio(precioFinal(producto))}
        </p>
        <p className="small">Stock disponible: {producto.stock}</p>

        <AvisoCarrito aviso={aviso} onCerrar={cerrarAviso} />

        <Form.Group className="mb-3" style={{ maxWidth: 140 }}>
          <Form.Label htmlFor="cantidad">Cantidad</Form.Label>
          <Form.Control
            id="cantidad"
            type="number"
            min={1}
            max={producto.stock}
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
          />
        </Form.Group>
        <Button disabled={producto.stock === 0} onClick={() => agregarProducto(producto, cantidad)}>
          Añadir al carrito
        </Button>
      </Col>
    </Row>
  );
}

export default DetalleProducto;
