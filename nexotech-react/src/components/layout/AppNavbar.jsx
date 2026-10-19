import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar, Nav, Container, Form, Button, NavDropdown } from 'react-bootstrap';

function AppNavbar({ totalCarrito = 0 }) {
  const [busqueda, setBusqueda] = useState('');

  const manejarBusqueda = (e) => {
    e.preventDefault();
    // La búsqueda se conecta al catálogo en un paso posterior.
  };

  return (
    <Navbar expand="lg" bg="white" className="border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          NexoTech
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
            <NavDropdown title="Categorías" id="menu-categorias">
              <NavDropdown.Item as={Link} to="/categorias">Ver todas</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={NavLink} to="/ofertas">Ofertas</Nav.Link>
            <Nav.Link as={NavLink} to="/nosotros">Nosotros</Nav.Link>
            <Nav.Link as={NavLink} to="/blogs">Blog</Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">Contacto</Nav.Link>
          </Nav>

          <Form className="d-flex me-lg-3 my-2 my-lg-0" role="search" onSubmit={manejarBusqueda}>
            <Form.Control
              type="search"
              placeholder="Buscar"
              aria-label="Buscar productos"
              className="me-2"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <Button type="submit" variant="outline-success">Buscar</Button>
          </Form>

          <div className="d-flex gap-2">
            <Button as={Link} to="/login" variant="outline-primary" size="sm">Iniciar sesión</Button>
            <Button as={Link} to="/registro" variant="primary" size="sm">Crear cuenta</Button>
            <Button as={Link} to="/carrito" variant="success" size="sm">
              <i className="bi bi-cart3 me-1" />
              Carrito ${totalCarrito.toLocaleString('es-CL')}
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
