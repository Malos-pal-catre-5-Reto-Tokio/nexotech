import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Form } from 'react-bootstrap';
import CampoTexto from '../../components/forms/CampoTexto.jsx';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { actualizarCategoria, crearCategoria, listarCategorias } from '../../services/categoriasService.js';
import { validarCategoria } from '../../utils/validaciones.js';

function FormCategoria() {
  const { id } = useParams();
  const editando = !!id;
  const navegar = useNavigate();
  // La API lista todas las categorías (son pocas); se busca la que se edita.
  const { datos: categorias, cargando, error } = useDatos(listarCategorias);
  const [datos, setDatos] = useState({ slug: '', nombre: '' });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const existente = editando ? categorias?.find((c) => String(c.id) === id) : null;
  useEffect(() => {
    if (existente) setDatos({ slug: existente.slug, nombre: existente.nombre });
  }, [existente]);

  const enviar = async (e) => {
    e.preventDefault();
    const encontrados = validarCategoria(datos);
    setErrores(encontrados);
    setErrorApi(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const cuerpo = { slug: datos.slug.trim(), nombre: datos.nombre.trim() };
      if (editando) await actualizarCategoria(id, cuerpo);
      else await crearCategoria(cuerpo);
      navegar('/admin/categorias');
    } catch (err) {
      setErrorApi(err.message);
      setEnviando(false);
    }
  };

  return (
    <section>
      <h1 className="h4 mb-3">{editando ? 'Editar categoría' : 'Nueva categoría'}</h1>
      <EstadoCarga cargando={editando && cargando} error={editando ? error : null}>
        {editando && !existente ? <Alert variant="warning">La categoría no existe.</Alert> : (
          <Form onSubmit={enviar} noValidate style={{ maxWidth: 480 }}>
            {errorApi && <Alert variant="danger">{errorApi}</Alert>}
            <CampoTexto id="nombre" etiqueta="Nombre" valor={datos.nombre} error={errores.nombre} maxLength={60}
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
            <CampoTexto id="slug" etiqueta="Identificador (slug)" valor={datos.slug} error={errores.slug} maxLength={40}
              placeholder="ej: notebooks" onChange={(e) => setDatos({ ...datos, slug: e.target.value })} />
            <Button type="submit" disabled={enviando}>{enviando ? 'Guardando...' : 'Guardar'}</Button>
            <Link to="/admin/categorias" className="btn btn-link">Cancelar</Link>
          </Form>
        )}
      </EstadoCarga>
    </section>
  );
}

export default FormCategoria;
