import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import CampoTexto from '../../components/forms/CampoTexto.jsx';
import SelectorRegionComuna from '../../components/forms/SelectorRegionComuna.jsx';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { actualizarUsuario, crearUsuario, obtenerUsuario } from '../../services/usuariosService.js';
import { validarUsuarioAdmin } from '../../utils/validaciones.js';

const VACIO = {
  run: '', nombre: '', apellidos: '', correo: '', rol: 'cliente', password: '', region: '', comuna: '', direccion: '',
};

function FormUsuario() {
  const { id } = useParams();
  const editando = !!id;
  const navegar = useNavigate();
  const { datos: existente, cargando, error } = useDatos(
    () => (editando ? obtenerUsuario(id) : Promise.resolve(null)), [id]);
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (existente) {
      setDatos({
        run: existente.run, nombre: existente.nombre, apellidos: existente.apellidos, correo: existente.correo,
        rol: existente.rol, password: '', region: existente.region ?? '', comuna: existente.comuna ?? '',
        direccion: existente.direccion ?? '',
      });
    }
  }, [existente]);

  const cambiar = (campo) => (e) => {
    const valor = e.target.value;
    setDatos((previo) => ({ ...previo, [campo]: valor, ...(campo === 'region' ? { comuna: '' } : {}) }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const encontrados = validarUsuarioAdmin(datos, { creando: !editando });
    setErrores(encontrados);
    setErrorApi(null);
    if (Object.keys(encontrados).length > 0) return;

    const cuerpo = { ...datos, run: datos.run.trim().toUpperCase(), correo: datos.correo.trim() };
    setEnviando(true);
    try {
      if (editando) await actualizarUsuario(id, cuerpo);
      else await crearUsuario(cuerpo);
      navegar('/admin/usuarios');
    } catch (err) {
      setErrorApi(err.message);
      setEnviando(false);
    }
  };

  const campo = (clave, etiqueta, extra = {}) => (
    <CampoTexto id={clave} etiqueta={etiqueta} valor={datos[clave]} onChange={cambiar(clave)} error={errores[clave]} {...extra} />
  );

  return (
    <section>
      <h1 className="h4 mb-3">{editando ? 'Editar usuario' : 'Nuevo usuario'}</h1>
      <EstadoCarga cargando={editando && cargando} error={editando ? error : null}>
        {errorApi && <Alert variant="danger">{errorApi}</Alert>}
        <Form onSubmit={enviar} noValidate>
          <Row>
            <Col md={4}>{campo('run', 'RUN', { maxLength: 9, placeholder: 'Ej: 19011022K' })}</Col>
            <Col md={4}>{campo('nombre', 'Nombre', { maxLength: 50 })}</Col>
            <Col md={4}>{campo('apellidos', 'Apellidos', { maxLength: 100 })}</Col>
            <Col md={6}>{campo('correo', 'Correo', { tipo: 'email', maxLength: 100 })}</Col>
            <Col md={3}>
              <Form.Group controlId="rol" className="mb-3">
                <Form.Label>Rol<span className="text-danger"> *</span></Form.Label>
                <Form.Select value={datos.rol} onChange={cambiar('rol')} isInvalid={!!errores.rol}>
                  <option value="cliente">Cliente</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errores.rol}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              {campo('password', editando ? 'Contraseña (opcional)' : 'Contraseña', {
                tipo: 'password', requerido: !editando, autoComplete: 'new-password', maxLength: 10,
                placeholder: editando ? 'Vacía = no cambia' : '4 a 10 caracteres',
              })}
            </Col>
            <SelectorRegionComuna region={datos.region} comuna={datos.comuna} errorRegion={errores.region}
              errorComuna={errores.comuna} onRegion={cambiar('region')} onComuna={cambiar('comuna')} />
            <Col md={12}>{campo('direccion', 'Dirección', { maxLength: 150 })}</Col>
          </Row>
          <Button type="submit" disabled={enviando}>{enviando ? 'Guardando...' : 'Guardar'}</Button>
          <Link to="/admin/usuarios" className="btn btn-link">Cancelar</Link>
        </Form>
      </EstadoCarga>
    </section>
  );
}

export default FormUsuario;
