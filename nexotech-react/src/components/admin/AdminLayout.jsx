import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button, Col, Nav, Row } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext.jsx';
import { MENU_ADMIN } from './menu.js';

// Estructura del panel: barra lateral (arriba en móvil) y el contenido de cada sección.
function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();
  const opciones = MENU_ADMIN.filter((opcion) => opcion.roles.includes(usuario.rol));

  const salir = async () => {
    await cerrarSesion();
    navegar('/');
  };

  return (
    <Row className="g-0 min-vh-100">
      <Col xs={12} lg={2} className="bg-light border-end p-3">
        <p className="fw-bold mb-1">NexoTech</p>
        <p className="small text-muted">{usuario.nombre} · {usuario.rol}</p>
        <Nav className="flex-lg-column" as="nav" aria-label="Menú de administración">
          {opciones.map((opcion) => (
            <Nav.Link key={opcion.a} as={NavLink} to={opcion.a} end={opcion.fin}>
              <i className={`bi ${opcion.icono} me-2`} aria-hidden="true" />{opcion.texto}
            </Nav.Link>
          ))}
        </Nav>
        <hr />
        <div className="d-grid gap-2">
          <Link to="/" className="btn btn-dark btn-sm">Tienda</Link>
          <Button variant="danger" size="sm" onClick={salir}>Cerrar sesión</Button>
        </div>
      </Col>
      <Col xs={12} lg={10} className="p-4">
        <Outlet />
      </Col>
    </Row>
  );
}

export default AdminLayout;
