import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import EstadoOrden from '../../components/admin/EstadoOrden.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { listarOrdenes } from '../../services/ordenesService.js';
import { formatearPrecio } from '../../utils/precios.js';
import { formatearFecha } from '../../utils/formato.js';

function Ordenes() {
  const { datos: ordenes, cargando, error } = useDatos(() => listarOrdenes());

  return (
    <section>
      <h1 className="h4 mb-3">Órdenes y boletas</h1>
      <EstadoCarga cargando={cargando} error={error}>
        {ordenes && (ordenes.length === 0 ? <p className="text-muted">Aún no hay órdenes.</p> : (
          <Table responsive hover className="align-middle">
            <thead>
              <tr><th>Código</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th /></tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td>{orden.codigo}</td>
                  <td>{orden.nombre} {orden.apellidos}<br /><small className="text-muted">{orden.correo}</small></td>
                  <td>{formatearFecha(orden.creadoEn)}</td>
                  <td>{formatearPrecio(orden.total)}</td>
                  <td><EstadoOrden estado={orden.estado} /></td>
                  <td><Link to={`/admin/ordenes/${orden.id}`} className="btn btn-outline-primary btn-sm">Ver boleta</Link></td>
                </tr>
              ))}
            </tbody>
          </Table>
        ))}
      </EstadoCarga>
    </section>
  );
}

export default Ordenes;
