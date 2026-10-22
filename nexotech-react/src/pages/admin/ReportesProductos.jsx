import { Link } from 'react-router-dom';
import { Alert, Card, Table } from 'react-bootstrap';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { obtenerReportes } from '../../services/reportesService.js';
import { formatearPrecio } from '../../utils/precios.js';

function ReportesProductos() {
  const { datos, cargando, error } = useDatos(obtenerReportes);

  return (
    <section>
      <Link to="/admin/productos">← Volver a productos</Link>
      <h1 className="h4 my-3">Reportes de productos</h1>
      <EstadoCarga cargando={cargando} error={error}>
        {datos && (
          <>
            {datos.resumen.productosCriticos > 0 && (
              <Alert variant="warning">
                Hay {datos.resumen.productosCriticos} producto(s) con stock crítico.{' '}
                <Link to="/admin/productos/criticos">Ver listado</Link>
              </Alert>
            )}
            <Card className="mb-4">
              <Card.Header>Productos más vendidos</Card.Header>
              <Table responsive className="mb-0">
                <thead><tr><th>Producto</th><th>Unidades</th><th>Ingresos</th></tr></thead>
                <tbody>
                  {datos.masVendidos.length === 0
                    ? <tr><td colSpan="3" className="text-muted">Aún no hay ventas.</td></tr>
                    : datos.masVendidos.map((p) => (
                      <tr key={p.nombre}><td>{p.nombre}</td><td>{p.unidades}</td><td>{formatearPrecio(p.ingresos)}</td></tr>
                    ))}
                </tbody>
              </Table>
            </Card>
            <Card>
              <Card.Header>Inventario por categoría</Card.Header>
              <Table responsive className="mb-0">
                <thead><tr><th>Categoría</th><th>Productos</th><th>Unidades en stock</th></tr></thead>
                <tbody>
                  {datos.stockPorCategoria.map((c) => (
                    <tr key={c.nombre}><td>{c.nombre}</td><td>{c.productos}</td><td>{c.unidades}</td></tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )}
      </EstadoCarga>
    </section>
  );
}

export default ReportesProductos;
