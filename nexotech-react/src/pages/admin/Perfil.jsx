import { useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import CampoTexto from '../../components/forms/CampoTexto.jsx';
import SelectorRegionComuna from '../../components/forms/SelectorRegionComuna.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { validarPerfil } from '../../utils/validaciones.js';

function Perfil() {
  const { usuario, actualizarPerfil } = useAuth();
  const [datos, setDatos] = useState({
    nombre: usuario.nombre, apellidos: usuario.apellidos, region: usuario.region ?? '', comuna: usuario.comuna ?? '',
    direccion: usuario.direccion ?? '', passwordActual: '', passwordNueva: '', confirmarPassword: '',
  });
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (e) => {
    const valor = e.target.value;
    setDatos((previo) => ({ ...previo, [campo]: valor, ...(campo === 'region' ? { comuna: '' } : {}) }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const encontrados = validarPerfil(datos);
    setErrores(encontrados);
    setAviso(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await actualizarPerfil({
        nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), region: datos.region, comuna: datos.comuna,
        direccion: datos.direccion.trim(), passwordActual: datos.passwordActual, passwordNueva: datos.passwordNueva,
      });
      setAviso({ tipo: 'success', texto: 'Perfil actualizado correctamente.' });
      setDatos((previo) => ({ ...previo, passwordActual: '', passwordNueva: '', confirmarPassword: '' }));
    } catch (error) {
      setAviso({ tipo: 'danger', texto: error.message });
    } finally {
      setEnviando(false);
    }
  };

  const campo = (clave, etiqueta, extra = {}) => (
    <CampoTexto id={clave} etiqueta={etiqueta} valor={datos[clave]} onChange={cambiar(clave)} error={errores[clave]} {...extra} />
  );

  return (
    <section style={{ maxWidth: 760 }}>
      <h1 className="h4 mb-1">Mi perfil</h1>
      <p className="text-muted">{usuario.correo} · RUN {usuario.run} · rol {usuario.rol}</p>
      {aviso && <Alert variant={aviso.tipo} role="status">{aviso.texto}</Alert>}
      <Form onSubmit={enviar} noValidate>
        <Row>
          <Col md={6}>{campo('nombre', 'Nombre', { maxLength: 50 })}</Col>
          <Col md={6}>{campo('apellidos', 'Apellidos', { maxLength: 100 })}</Col>
          <SelectorRegionComuna region={datos.region} comuna={datos.comuna} errorRegion={errores.region}
            errorComuna={errores.comuna} onRegion={cambiar('region')} onComuna={cambiar('comuna')} />
          <Col md={12}>{campo('direccion', 'Dirección', { maxLength: 150 })}</Col>
        </Row>
        <h2 className="h6 mt-2">Cambiar contraseña (opcional)</h2>
        <Row>
          <Col md={4}>{campo('passwordActual', 'Contraseña actual', { tipo: 'password', requerido: false, autoComplete: 'current-password' })}</Col>
          <Col md={4}>{campo('passwordNueva', 'Contraseña nueva', { tipo: 'password', requerido: false, autoComplete: 'new-password', maxLength: 10 })}</Col>
          <Col md={4}>{campo('confirmarPassword', 'Confirmar nueva', { tipo: 'password', requerido: false, autoComplete: 'new-password', maxLength: 10 })}</Col>
        </Row>
        <Button type="submit" disabled={enviando}>{enviando ? 'Guardando...' : 'Guardar cambios'}</Button>
      </Form>
    </section>
  );
}

export default Perfil;
