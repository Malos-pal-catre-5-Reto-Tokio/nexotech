import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { crearOrden } from '../services/ordenesService.js';
import { validarCheckout } from '../utils/validaciones.js';
import { formatearPrecio } from '../utils/precios.js';
import { REGIONES_COMUNAS } from '../data/regionesComunas.js';

const FORMULARIO_VACIO = {
  nombre: '', apellidos: '', correo: '', calle: '', departamento: '',
  region: '', comuna: '', indicaciones: '',
};

function Checkout() {
  const { items, cupon, total, vaciar } = useCarrito();
  const { usuario } = useAuth();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [pago, setPago] = useState('aprobado');
  const [enviando, setEnviando] = useState(false);
  const [errorApi, setErrorApi] = useState(null);

  // Con sesión iniciada, los datos del cliente y la dirección se completan solos (sin pisar lo ya escrito).
  useEffect(() => {
    if (!usuario) return;
    setDatos((previo) => ({
      ...previo,
      nombre: previo.nombre || usuario.nombre,
      apellidos: previo.apellidos || usuario.apellidos,
      correo: previo.correo || usuario.correo,
      calle: previo.calle || usuario.direccion || '',
      region: previo.region || usuario.region || '',
      comuna: previo.comuna || usuario.comuna || '',
    }));
  }, [usuario]);

  if (items.length === 0) {
    return (
      <section className="text-center py-5">
        <h1 className="h3">Tu carrito está vacío</h1>
        <Link to="/productos" className="btn btn-primary mt-2">Ver productos</Link>
      </section>
    );
  }

  const cambiar = (campo) => (e) => {
    const valor = e.target.value;
    // Al cambiar de región, la comuna elegida deja de ser válida.
    setDatos((previo) => ({ ...previo, [campo]: valor, ...(campo === 'region' ? { comuna: '' } : {}) }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const encontrados = validarCheckout(datos);
    setErrores(encontrados);
    setErrorApi(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const orden = await crearOrden({
        cliente: { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), correo: datos.correo.trim() },
        entrega: {
          calle: datos.calle.trim(), departamento: datos.departamento.trim(), region: datos.region,
          comuna: datos.comuna, indicaciones: datos.indicaciones.trim(),
        },
        items: items.map((item) => ({ id: item.id, cantidad: item.cantidad })),
        cupon: cupon ?? '',
        pago,
      });
      if (orden.estado === 'pagada') {
        vaciar();
        navegar(`/compra/exitosa/${orden.id}`);
      } else {
        navegar(`/compra/error/${orden.id}`); // el carrito se conserva para poder reintentar
      }
    } catch (error) {
      setErrorApi(error.message);
      setEnviando(false);
    }
  };

  const campo = (id, etiqueta, { tipo = 'text', requerido = true, ...extra } = {}) => (
    <Form.Group controlId={id} className="mb-3">
      <Form.Label>{etiqueta}{requerido && <span className="text-danger"> *</span>}</Form.Label>
      <Form.Control type={tipo} value={datos[id]} onChange={cambiar(id)} isInvalid={!!errores[id]} {...extra} />
      <Form.Control.Feedback type="invalid">{errores[id]}</Form.Control.Feedback>
    </Form.Group>
  );

  const comunas = REGIONES_COMUNAS[datos.region] ?? [];

  return (
    <section>
      <h1 className="h3 mb-3">Finalizar compra</h1>

      <Card className="mb-4">
        <Card.Body>
          <Table responsive size="sm" className="mb-2">
            <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{formatearPrecio(item.precio)}</td>
                  <td>{item.cantidad}</td>
                  <td>{formatearPrecio(item.precio * item.cantidad)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="h5 text-end mb-0">Total a pagar: {formatearPrecio(total)}</p>
        </Card.Body>
      </Card>

      {errorApi && <Alert variant="danger">{errorApi}</Alert>}

      <Form onSubmit={enviar} noValidate>
        <h2 className="h5">Información del cliente</h2>
        <Row>
          <Col md={6}>{campo('nombre', 'Nombre')}</Col>
          <Col md={6}>{campo('apellidos', 'Apellidos')}</Col>
          <Col md={12}>{campo('correo', 'Correo', { tipo: 'email' })}</Col>
        </Row>

        <h2 className="h5 mt-2">Dirección de entrega</h2>
        <Row>
          <Col md={8}>{campo('calle', 'Calle')}</Col>
          <Col md={4}>{campo('departamento', 'Departamento (opcional)', { requerido: false, placeholder: 'Ej: 603' })}</Col>
          <Col md={6}>
            <Form.Group controlId="region" className="mb-3">
              <Form.Label>Región<span className="text-danger"> *</span></Form.Label>
              <Form.Select value={datos.region} onChange={cambiar('region')} isInvalid={!!errores.region}>
                <option value="">-- Seleccione la región --</option>
                {Object.keys(REGIONES_COMUNAS).map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errores.region}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="comuna" className="mb-3">
              <Form.Label>Comuna<span className="text-danger"> *</span></Form.Label>
              <Form.Select value={datos.comuna} onChange={cambiar('comuna')} isInvalid={!!errores.comuna} disabled={!datos.region}>
                <option value="">-- Seleccione la comuna --</option>
                {comunas.map((comuna) => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errores.comuna}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={12}>
            {campo('indicaciones', 'Indicaciones para la entrega (opcional)', {
              requerido: false, as: 'textarea', rows: 2, placeholder: 'Ej: entre calles, color del edificio, no tiene timbre',
            })}
          </Col>
        </Row>

        <h2 className="h5 mt-2">Pago (simulado)</h2>
        <Form.Check type="radio" id="pago-aprobado" name="pago" label="Pago exitoso"
          checked={pago === 'aprobado'} onChange={() => setPago('aprobado')} />
        <Form.Check type="radio" id="pago-rechazado" name="pago" label="Simular error en el pago"
          checked={pago === 'rechazado'} onChange={() => setPago('rechazado')} />

        <div className="text-end mt-3">
          <Button type="submit" variant="success" disabled={enviando}>
            {enviando ? 'Procesando...' : `Pagar ahora ${formatearPrecio(total)}`}
          </Button>
        </div>
      </Form>
    </section>
  );
}

export default Checkout;
