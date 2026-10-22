import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import CampoTexto from '../components/forms/CampoTexto.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validarLogin } from '../utils/validaciones.js';
import { esPersonal } from '../utils/roles.js';

function Login() {
  const { usuario, iniciarSesion } = useAuth();
  const ubicacion = useLocation();
  const [datos, setDatos] = useState({ correo: '', password: '' });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Con sesión iniciada se redirige: a la página que se pedía, al panel (personal) o a la tienda.
  if (usuario) {
    return <Navigate to={ubicacion.state?.desde ?? (esPersonal(usuario) ? '/admin' : '/')} replace />;
  }

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    const encontrados = validarLogin(datos);
    setErrores(encontrados);
    setErrorApi(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await iniciarSesion(datos.correo.trim(), datos.password); // al guardarse el usuario, arriba se redirige
    } catch (error) {
      setErrorApi(error.message);
      setEnviando(false);
    }
  };

  return (
    <Card className="mx-auto" style={{ maxWidth: 420 }}>
      <Card.Body>
        <h1 className="h4 mb-3">Iniciar sesión</h1>
        {errorApi && <Alert variant="danger">{errorApi}</Alert>}
        <Form onSubmit={enviar} noValidate>
          <CampoTexto id="correo" etiqueta="Correo" tipo="email" valor={datos.correo}
            onChange={cambiar('correo')} error={errores.correo} autoComplete="email" />
          <CampoTexto id="password" etiqueta="Contraseña" tipo="password" valor={datos.password}
            onChange={cambiar('password')} error={errores.password} autoComplete="current-password" />
          <Button type="submit" className="w-100" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </Form>
        <p className="text-center mt-3 mb-0">
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </p>
      </Card.Body>
    </Card>
  );
}

export default Login;
