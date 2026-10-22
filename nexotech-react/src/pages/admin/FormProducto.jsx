import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import CampoTexto from '../../components/forms/CampoTexto.jsx';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import { useCategorias } from '../../hooks/useCategorias.js';
import { useDatos } from '../../hooks/useDatos.js';
import { actualizarProducto, crearProducto, obtenerProducto } from '../../services/productosService.js';
import { validarProducto } from '../../utils/validaciones.js';

const VACIO = {
  codigo: '', nombre: '', descripcion: '', precio: '', stock: '', stockCritico: '0',
  descuento: '0', imagen: '', categoriaId: '',
};

// Sirve para crear (/admin/productos/nuevo) y para editar (/admin/productos/:id/editar).
function FormProducto() {
  const { id } = useParams();
  const editando = !!id;
  const navegar = useNavigate();
  const categorias = useCategorias();
  const { datos: existente, cargando, error } = useDatos(
    () => (editando ? obtenerProducto(id) : Promise.resolve(null)), [id]);

  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (existente) {
      setDatos({
        codigo: existente.codigo, nombre: existente.nombre, descripcion: existente.descripcion ?? '',
        precio: String(existente.precio), stock: String(existente.stock), stockCritico: String(existente.stockCritico),
        descuento: String(existente.descuento), imagen: existente.imagen ?? '', categoriaId: String(existente.categoriaId),
      });
    }
  }, [existente]);

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    const encontrados = validarProducto(datos);
    setErrores(encontrados);
    setErrorApi(null);
    if (Object.keys(encontrados).length > 0) return;

    const producto = {
      codigo: datos.codigo.trim(), nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(),
      precio: Number(datos.precio), stock: Number(datos.stock), stockCritico: Number(datos.stockCritico),
      descuento: Number(datos.descuento), imagen: datos.imagen.trim(), categoriaId: Number(datos.categoriaId),
    };
    setEnviando(true);
    try {
      if (editando) await actualizarProducto(id, producto);
      else await crearProducto(producto);
      navegar('/admin/productos');
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
      <h1 className="h4 mb-3">{editando ? 'Editar producto' : 'Nuevo producto'}</h1>
      <EstadoCarga cargando={editando && cargando} error={editando ? error : null}>
        {errorApi && <Alert variant="danger">{errorApi}</Alert>}
        <Form onSubmit={enviar} noValidate>
          <Row>
            <Col md={4}>{campo('codigo', 'Código', { maxLength: 20 })}</Col>
            <Col md={8}>{campo('nombre', 'Nombre', { maxLength: 100 })}</Col>
            <Col md={12}>{campo('descripcion', 'Descripción', { requerido: false, as: 'textarea', rows: 3 })}</Col>
            <Col md={3}>{campo('precio', 'Precio', { tipo: 'number', min: 0 })}</Col>
            <Col md={3}>{campo('stock', 'Stock', { tipo: 'number', min: 0 })}</Col>
            <Col md={3}>{campo('stockCritico', 'Stock crítico', { tipo: 'number', min: 0 })}</Col>
            <Col md={3}>{campo('descuento', 'Descuento (%)', { tipo: 'number', min: 0, max: 90 })}</Col>
            <Col md={6}>
              <Form.Group controlId="categoriaId" className="mb-3">
                <Form.Label>Categoría<span className="text-danger"> *</span></Form.Label>
                <Form.Select value={datos.categoriaId} onChange={cambiar('categoriaId')} isInvalid={!!errores.categoriaId}>
                  <option value="">-- Seleccione la categoría --</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errores.categoriaId}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>{campo('imagen', 'Imagen (ruta)', { requerido: false, placeholder: '/img/productos/mouse.jpg' })}</Col>
          </Row>
          <Button type="submit" disabled={enviando}>{enviando ? 'Guardando...' : 'Guardar'}</Button>
          <Link to="/admin/productos" className="btn btn-link">Cancelar</Link>
        </Form>
      </EstadoCarga>
    </section>
  );
}

export default FormProducto;
