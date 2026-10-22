import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import CampoTexto from '../components/forms/CampoTexto.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { enviarMensaje } from '../services/contactoService.js';
import { validarContacto } from '../utils/validaciones.js';

const FORMULARIO_VACIO = { nombre: '', correo: '', comentario: '' };

function Contacto() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Con sesión iniciada se completan el nombre y el correo (sin pisar lo que ya se escribió).
  useEffect(() => {
    if (!usuario) return;
    setDatos((previo) => ({
      ...previo,
      nombre: previo.nombre || `${usuario.nombre} ${usuario.apellidos}`.trim(),
      correo: previo.correo || usuario.correo,
    }));
  }, [usuario]);

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    const encontrados = validarContacto(datos);
    setErrores(encontrados);
    setAviso(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await enviarMensaje({
        nombre: datos.nombre.trim(), correo: datos.correo.trim(), comentario: datos.comentario.trim(),
      });
      setAviso({ tipo: 'success', texto: 'Mensaje enviado correctamente. Gracias por contactarnos.' });
      setDatos({ ...FORMULARIO_VACIO, nombre: datos.nombre, correo: datos.correo }); // limpia solo el comentario
    } catch (error) {
      setAviso({ tipo: 'danger', texto: error.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className="mx-auto" style={{ maxWidth: 560 }}>
      <Card.Body>
        <h1 className="h4 mb-3">Formulario de contacto</h1>
        {aviso && <Alert variant={aviso.tipo} role="status">{aviso.texto}</Alert>}
        <Form onSubmit={enviar} noValidate>
          <CampoTexto id="nombre" etiqueta="Nombre completo" valor={datos.nombre}
            onChange={cambiar('nombre')} error={errores.nombre} maxLength={100} />
          <CampoTexto id="correo" etiqueta="Correo electrónico" tipo="email" valor={datos.correo}
            onChange={cambiar('correo')} error={errores.correo} maxLength={100} />
          <CampoTexto id="comentario" etiqueta="Comentario" valor={datos.comentario}
            onChange={cambiar('comentario')} error={errores.comentario} as="textarea" rows={5} maxLength={500} />
          <Button type="submit" className="w-100" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar mensaje'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Contacto;
