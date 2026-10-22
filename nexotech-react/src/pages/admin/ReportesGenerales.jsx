import { Card, Col, Row, Table } from 'react-bootstrap';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import EstadoOrden from '../../components/admin/EstadoOrden.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { obtenerReportes } from '../../services/reportesService.js';
import { formatearFecha } from '../../utils/formato.js';
import { formatearPrecio } from '../../utils/precios.js';

function Metrica({ titulo, valor }) {
  return (
    <Col sm={6} lg={3}>
      <Card className="h-100"><Card.Body>
        <Card.Subtitle className="text-muted mb-1">{titulo}</Card.Subtitle>
        <Card.Title as="p" className="h4 mb-0">{valor}</Card.Title>
      </Card.Body></Card>
    </Col>
  );
}

function ReportesGenerales() {
  const { datos, cargando, error } = useDatos(obtenerReportes);

  return (
    <section>
      <h1 className="h4 mb-3">Reportes</h1>
      <EstadoCarga cargando={cargando} error={error}>
        {datos && (
          <>
            <Row className="g-3 mb-4">
              <Metrica titulo="Ingresos" valor={formatearPrecio(datos.resumen.ingresos)} />
              <Metrica titulo="Compras exitosas" valor={datos.resumen.ordenesPagadas} />
              <Metrica titulo="Pagos fallidos" valor={datos.resumen.ordenesFallidas} />
              <Metrica titulo="Usuarios" valor={datos.resumen.usuarios} />
            </Row>
            <Row className="g-3">
              <Col lg={6}>
                <Card><Card.Header>Órdenes por estado</Card.Header>
                  <Table responsive className="mb-0">
                    <thead><tr><th>Estado</th><th>Órdenes</th><th>Monto</th></tr></thead>
                    <tbody>
                      {datos.ordenesPorEstado.map((fila) => (
                        <tr key={fila.estado}>
                          <td><EstadoOrden estado={fila.estado} /></td><td>{fila.cantidad}</td><td>{formatearPrecio(fila.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card>
              </Col>
              <Col lg={6}>
                <Card><Card.Header>Ventas de los últimos 30 días</Card.Header>
                  <Table responsive className="mb-0">
                    <thead><tr><th>Día</th><th>Órdenes</th><th>Total</th></tr></thead>
                    <tbody>
                      {datos.ventasPorDia.length === 0
                        ? <tr><td colSpan="3" className="text-muted">Sin ventas en el período.</td></tr>
                        : datos.ventasPorDia.map((fila) => (
                          <tr key={fila.dia}><td>{formatearFecha(fila.dia)}</td><td>{fila.ordenes}</td><td>{formatearPrecio(fila.total)}</td></tr>
                        ))}
                    </tbody>
                  </Table>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </EstadoCarga>
    </section>
  );
}

export default ReportesGenerales;
