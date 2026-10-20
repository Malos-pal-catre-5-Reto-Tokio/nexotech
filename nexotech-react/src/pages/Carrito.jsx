import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Form, InputGroup, Table } from 'react-bootstrap';
import { useCarrito } from '../context/CarritoContext.jsx';
import { formatearPrecio } from '../utils/precios.js';

function Carrito() {
  const { items, cupon, subtotal, descuento, total, cambiarCantidad, quitar, vaciar, aplicarCupon } = useCarrito();
  const [codigo, setCodigo] = useState('');
  const [mensajeCupon, setMensajeCupon] = useState(null);

  const usarCupon = (e) => {
    e.preventDefault();
    const valido = aplicarCupon(codigo);
    setMensajeCupon(valido
      ? { tipo: 'success', texto: 'Cupón aplicado.' }
      : { tipo: 'danger', texto: 'El cupón no es válido.' });
    if (valido) setCodigo('');
  };

  if (items.length === 0) {
    return (
      <section className="text-center py-5">
        <h1 className="h3">Tu carrito está vacío</h1>
        <Link to="/productos" className="btn btn-primary mt-2">Ver productos</Link>
      </section>
    );
  }

  return (
    <section>
      <h1 className="h3 mb-3">Carrito de compras</h1>

      <Table responsive className="align-middle">
        <thead>
          <tr>
            <th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <img src={item.imagen} alt="" width="48" height="48" className="me-2 rounded" style={{ objectFit: 'contain' }} />
                {item.nombre}
              </td>
              <td>{formatearPrecio(item.precio)}</td>
              <td>
                <InputGroup size="sm" style={{ width: 120 }}>
                  <Button variant="outline-secondary" aria-label={`Disminuir cantidad de ${item.nombre}`}
                    onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}>−</Button>
                  <InputGroup.Text className="flex-fill justify-content-center">{item.cantidad}</InputGroup.Text>
                  <Button variant="outline-secondary" aria-label={`Aumentar cantidad de ${item.nombre}`}
                    disabled={item.cantidad >= item.stock}
                    onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}>+</Button>
                </InputGroup>
              </td>
              <td>{formatearPrecio(item.precio * item.cantidad)}</td>
              <td>
                <Button variant="outline-danger" size="sm" aria-label={`Quitar ${item.nombre}`}
                  onClick={() => quitar(item.id)}>Quitar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Card className="ms-auto" style={{ maxWidth: 380 }}>
        <Card.Body>
          <Form onSubmit={usarCupon} className="mb-3">
            <InputGroup>
              <Form.Control placeholder="Código de cupón" aria-label="Código de cupón"
                value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              <Button type="submit" variant="outline-primary">Aplicar</Button>
            </InputGroup>
          </Form>
          {mensajeCupon && <Alert variant={mensajeCupon.tipo} className="py-2">{mensajeCupon.texto}</Alert>}

          <div className="d-flex justify-content-between"><span>Subtotal</span><span>{formatearPrecio(subtotal)}</span></div>
          {descuento > 0 && (
            <div className="d-flex justify-content-between text-success">
              <span>Descuento ({cupon})</span><span>-{formatearPrecio(descuento)}</span>
            </div>
          )}
          <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
            <span>Total</span><span data-testid="total-carrito">{formatearPrecio(total)}</span>
          </div>

          <div className="d-flex gap-2 mt-3">
            <Button variant="outline-secondary" onClick={vaciar}>Vaciar</Button>
            <Link to="/checkout" className="btn btn-success flex-fill">Comprar ahora</Link>
          </div>
        </Card.Body>
      </Card>
    </section>
  );
}

export default Carrito;
