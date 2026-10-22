import { Link, useParams } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';
import DetalleOrden from '../../components/checkout/DetalleOrden.jsx';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import EstadoOrden from '../../components/admin/EstadoOrden.jsx';
import { useOrden } from '../../hooks/useOrden.js';

function BoletaAdmin() {
  const { id } = useParams();
  const { orden, cargando, error } = useOrden(id);

  return (
    <section>
      <Link to="/admin/ordenes">← Volver a órdenes</Link>
      <EstadoCarga cargando={cargando} error={error}>
        {orden && (
          <Card className="mt-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <h1 className="h4">Boleta {orden.codigo} <EstadoOrden estado={orden.estado} /></h1>
                {/* El navegador permite guardar la boleta como PDF desde el cuadro de impresión. */}
                <Button variant="outline-secondary" size="sm" onClick={() => window.print()}>Imprimir boleta</Button>
              </div>
              <DetalleOrden orden={orden} />
            </Card.Body>
          </Card>
        )}
      </EstadoCarga>
    </section>
  );
}

export default BoletaAdmin;
