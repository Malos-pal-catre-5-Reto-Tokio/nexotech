import { Link } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import { MENU_ADMIN } from '../../components/admin/menu.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { obtenerReportes } from '../../services/reportesService.js';
import { formatearPrecio } from '../../utils/precios.js';

function Indicador({ titulo, valor, detalle, color }) {
  return (
    <Col md={4}>
      <Card bg={color} text={color === 'warning' ? 'dark' : 'white'} className="h-100">
        <Card.Body>
          <Card.Subtitle className="mb-1">{titulo}</Card.Subtitle>
          <Card.Title as="p" className="h2 mb-1">{valor}</Card.Title>
          <small>{detalle}</small>
        </Card.Body>
      </Card>
    </Col>
  );
}

function Dashboard() {
  const { usuario } = useAuth();
  const { datos, cargando, error } = useDatos(obtenerReportes);
  const accesos = MENU_ADMIN.filter((o) => o.roles.includes(usuario.rol) && o.a !== '/admin');

  return (
    <section>
      <h1 className="h4">Dashboard</h1>
      <p className="text-muted">Resumen de las actividades diarias</p>

      <EstadoCarga cargando={cargando} error={error}>
        {datos && (
          <Row className="g-3 mb-4">
            <Indicador titulo="Compras" valor={datos.resumen.ordenesPagadas} color="primary"
              detalle={`Ingresos: ${formatearPrecio(datos.resumen.ingresos)}`} />
            <Indicador titulo="Productos" valor={datos.resumen.productos} color="success"
              detalle={`Inventario actual: ${datos.resumen.unidadesInventario} · críticos: ${datos.resumen.productosCriticos}`} />
            <Indicador titulo="Usuarios" valor={datos.resumen.usuarios} color="warning"
              detalle={`Nuevos usuarios este mes: ${datos.resumen.usuariosNuevosMes}`} />
          </Row>
        )}
      </EstadoCarga>

      <Row xs={1} sm={2} lg={4} className="g-3">
        {accesos.map((acceso) => (
          <Col key={acceso.a}>
            <Card as={Link} to={acceso.a} className="h-100 text-center text-decoration-none shadow-sm">
              <Card.Body>
                <i className={`bi ${acceso.icono} fs-3 text-primary`} aria-hidden="true" />
                <span className="d-block fw-semibold text-dark mt-2">{acceso.texto}</span>
              </Card.Body>
            </Card>
          </Col>
        ))}
        <Col>
          <Card as={Link} to="/" className="h-100 text-center text-decoration-none shadow-sm">
            <Card.Body>
              <i className="bi bi-shop fs-3 text-primary" aria-hidden="true" />
              <span className="d-block fw-semibold text-dark mt-2">Tienda</span>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );
}

export default Dashboard;
