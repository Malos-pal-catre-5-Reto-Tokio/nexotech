import { Link, useParams } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import EstadoOrden from '../../components/admin/EstadoOrden.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { listarOrdenes } from '../../services/ordenesService.js';
import { obtenerUsuario } from '../../services/usuariosService.js';
import { formatearFecha } from '../../utils/formato.js';
import { formatearPrecio } from '../../utils/precios.js';

function HistorialUsuario() {
  const { id } = useParams();
  const { datos, cargando, error } = useDatos(
    () => Promise.all([obtenerUsuario(id), listarOrdenes({ usuario: id })]), [id]);

  return (
    <section>
      <Link to="/admin/usuarios">← Volver a usuarios</Link>
      <EstadoCarga cargando={cargando} error={error}>
        {datos && (
          <>
            <h1 className="h4 my-3">Historial de compras de {datos[0].nombre} {datos[0].apellidos}</h1>
            {datos[1].length === 0 ? <p className="text-muted">Este usuario aún no tiene compras.</p> : (
              <Table responsive hover className="align-middle">
                <thead><tr><th>Código</th><th>Fecha</th><th>Total</th><th>Estado</th><th /></tr></thead>
                <tbody>
                  {datos[1].map((orden) => (
                    <tr key={orden.id}>
                      <td>{orden.codigo}</td>
                      <td>{formatearFecha(orden.creadoEn)}</td>
                      <td>{formatearPrecio(orden.total)}</td>
                      <td><EstadoOrden estado={orden.estado} /></td>
                      <td><Link to={`/admin/ordenes/${orden.id}`} className="btn btn-outline-primary btn-sm">Ver boleta</Link></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </EstadoCarga>
    </section>
  );
}

export default HistorialUsuario;
