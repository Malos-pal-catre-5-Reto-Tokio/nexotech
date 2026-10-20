import { Table } from 'react-bootstrap';
import { formatearPrecio } from '../../utils/precios.js';

// Datos del cliente, dirección y productos de una orden (se usa en pago correcto y pago con error).
function DetalleOrden({ orden }) {
  const { cliente, entrega, items } = orden;

  return (
    <>
      <h2 className="h6 mt-3">Cliente</h2>
      <p className="mb-2">
        {cliente.nombre} {cliente.apellidos} · {cliente.correo}
      </p>

      <h2 className="h6">Dirección de entrega</h2>
      <p className="mb-2">
        {entrega.calle}{entrega.departamento ? `, ${entrega.departamento}` : ''}<br />
        {entrega.comuna}, {entrega.region}
        {entrega.indicaciones && <><br /><em>{entrega.indicaciones}</em></>}
      </p>

      <Table responsive size="sm" className="mt-3">
        <thead>
          <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.nombre}</td>
              <td>{formatearPrecio(item.precio)}</td>
              <td>{item.cantidad}</td>
              <td>{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {orden.descuento > 0 && (
        <p className="text-success text-end mb-1">Descuento: -{formatearPrecio(orden.descuento)}</p>
      )}
      <p className="h5 text-end" data-testid="total-orden">Total: {formatearPrecio(orden.total)}</p>
    </>
  );
}

export default DetalleOrden;
