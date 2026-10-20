import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import CampoTexto from '../components/forms/CampoTexto.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validarRegistro, PASSWORD_MIN, PASSWORD_MAX } from '../utils/validaciones.js';
import { REGIONES_COMUNAS } from '../data/regionesComunas.js';

const FORMULARIO_VACIO = {
  run: '', nombre: '', apellidos: '', correo: '', confirmarCorreo: '',
  password: '', confirmarPassword: '', region: '', comuna: '', direccion: '',
};

function Registro() {
  const { usuario, registrar } = useAuth();
  const navegar = useNavigate();
  const [datos, setDatos] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  const cambiar = (campo) => (e) => {
    const valor = e.target.value;
    setDatos((previo) => ({ ...previo, [campo]: valor, ...(campo === 'region' ? { comuna: '' } : {}) }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const encontrados = validarRegistro(datos);
    setErrores(encontrados);
    setErrorApi(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await registrar({
        run: datos.run.trim().toUpperCase(),
        nombre: datos.nombre.trim(),
        apellidos: datos.apellidos.trim(),
        correo: datos.correo.trim(),
        password: datos.password,
        region: datos.region,
        comuna: datos.comuna,
        direccion: datos.direccion.trim(),
      });
      navegar('/', { replace: true }); // el registro deja la sesión iniciada
    } catch (error) {
      setErrorApi(error.message);
      setEnviando(false);
    }
  };

  const campo = (id, etiqueta, extra = {}) => (
    <CampoTexto id={id} etiqueta={etiqueta} valor={datos[id]} onChange={cambiar(id)} error={errores[id]} {...extra} />
  );
  const comunas = REGIONES_COMUNAS[datos.region] ?? [];

  return (
    <Card className="mx-auto" style={{ maxWidth: 720 }}>
      <Card.Body>
        <h1 className="h4 mb-3">Crear cuenta</h1>
        {errorApi && <Alert variant="danger">{errorApi}</Alert>}
        <Form onSubmit={enviar} noValidate>
          <Row>
            <Col md={4}>{campo('run', 'RUN', { placeholder: 'Ej: 19011022K', maxLength: 9 })}</Col>
            <Col md={4}>{campo('nombre', 'Nombre', { maxLength: 50 })}</Col>
            <Col md={4}>{campo('apellidos', 'Apellidos', { maxLength: 100 })}</Col>
            <Col md={6}>{campo('correo', 'Correo electrónico', { tipo: 'email', maxLength: 100 })}</Col>
            <Col md={6}>{campo('confirmarCorreo', 'Confirmar correo', { tipo: 'email', maxLength: 100 })}</Col>
            <Col md={6}>
              {campo('password', 'Contraseña', { tipo: 'password', autoComplete: 'new-password',
                maxLength: PASSWORD_MAX, placeholder: `${PASSWORD_MIN} a ${PASSWORD_MAX} caracteres` })}
            </Col>
            <Col md={6}>
              {campo('confirmarPassword', 'Confirmar contraseña', { tipo: 'password', autoComplete: 'new-password', maxLength: PASSWORD_MAX })}
            </Col>
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
            <Col md={12}>{campo('direccion', 'Dirección', { maxLength: 150 })}</Col>
          </Row>
          <Button type="submit" className="w-100" disabled={enviando}>
            {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </Form>
        <p className="text-center mt-3 mb-0">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </Card.Body>
    </Card>
  );
}

export default Registro;
