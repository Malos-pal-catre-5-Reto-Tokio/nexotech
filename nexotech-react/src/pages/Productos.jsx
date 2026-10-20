import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import ListaProductos from '../components/productos/ListaProductos.jsx';
import AvisoCarrito from '../components/productos/AvisoCarrito.jsx';
import { useProductos } from '../hooks/useProductos.js';
import { useCategorias } from '../hooks/useCategorias.js';
import { useAgregarAlCarrito } from '../hooks/useAgregarAlCarrito.js';

// Los filtros viven en la URL (?categoria=...&q=...): se pueden compartir y funcionan con el botón "atrás".
function Productos() {
  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') ?? '';
  const q = params.get('q') ?? '';

  const [texto, setTexto] = useState(q);
  useEffect(() => setTexto(q), [q]); // si el buscador de la barra cambia la URL, se refleja aquí

  const categorias = useCategorias();
  const { productos, cargando, error } = useProductos({ categoria, q });
  const { aviso, agregarProducto, cerrarAviso } = useAgregarAlCarrito();

  const actualizarFiltro = (clave, valor) => {
    const nuevos = new URLSearchParams(params);
    if (valor) nuevos.set(clave, valor);
    else nuevos.delete(clave);
    setParams(nuevos);
  };

  const buscar = (e) => {
    e.preventDefault();
    actualizarFiltro('q', texto.trim());
  };

  return (
    <section>
      <h1 className="h3 mb-3">Productos</h1>

      <Form onSubmit={buscar} className="mb-3">
        <Row className="g-2">
          <Col xs={12} md={4}>
            <Form.Select
              aria-label="Categoría"
              value={categoria}
              onChange={(e) => actualizarFiltro('categoria', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.slug}>{c.nombre}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={8} md={6}>
            <Form.Control
              type="search"
              placeholder="Buscar producto"
              aria-label="Buscar producto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </Col>
          <Col xs={4} md={2}>
            <Button type="submit" variant="outline-success" className="w-100">Buscar</Button>
          </Col>
        </Row>
      </Form>

      <AvisoCarrito aviso={aviso} onCerrar={cerrarAviso} />
      {error && <Alert variant="danger">No se pudo cargar el catálogo: {error}</Alert>}
      {cargando ? <Spinner animation="border" /> : (
        !error && <ListaProductos productos={productos} onAgregar={agregarProducto} />
      )}
    </section>
  );
}

export default Productos;
