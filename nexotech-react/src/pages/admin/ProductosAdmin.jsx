import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Table } from 'react-bootstrap';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import ModalConfirmar from '../../components/admin/ModalConfirmar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { listarProductos, eliminarProducto } from '../../services/productosService.js';
import { precioFinal, formatearPrecio } from '../../utils/precios.js';
import { esAdmin } from '../../utils/roles.js';

// Lista de productos. Con la propiedad "criticos" muestra solo los que tienen stock en el nivel crítico o bajo él.
function ProductosAdmin({ criticos = false }) {
  const { usuario } = useAuth();
  const puedeEditar = esAdmin(usuario);
  const { datos: productos, cargando, error, recargar } = useDatos(
    () => listarProductos(criticos ? { critico: true } : {}), [criticos]);
  const [aEliminar, setAEliminar] = useState(null);
  const [aviso, setAviso] = useState(null);

  const confirmarEliminar = async () => {
    try {
      await eliminarProducto(aEliminar.id);
      setAviso({ tipo: 'success', texto: `Producto "${aEliminar.nombre}" eliminado.` });
      recargar();
    } catch (e) {
      setAviso({ tipo: 'danger', texto: e.message });
    } finally {
      setAEliminar(null);
    }
  };

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 mb-0">{criticos ? 'Productos críticos' : 'Productos'}</h1>
        <div className="d-flex flex-wrap gap-2">
          {criticos
            ? <Link to="/admin/productos" className="btn btn-outline-secondary btn-sm">Ver todos</Link>
            : <Link to="/admin/productos/criticos" className="btn btn-outline-warning btn-sm">Productos críticos</Link>}
          <Link to="/admin/productos/reportes" className="btn btn-outline-secondary btn-sm">Reportes</Link>
          {puedeEditar && <Link to="/admin/productos/nuevo" className="btn btn-primary btn-sm">Nuevo producto</Link>}
        </div>
      </div>

      {aviso && <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)} role="status">{aviso.texto}</Alert>}

      <EstadoCarga cargando={cargando} error={error}>
        {productos && (productos.length === 0 ? <p className="text-muted">No hay productos para mostrar.</p> : (
          <Table responsive hover className="align-middle">
            <thead>
              <tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th /></tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.codigo}</td>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>
                  <td>
                    {formatearPrecio(precioFinal(producto))}
                    {producto.descuento > 0 && <Badge bg="danger" className="ms-1">-{producto.descuento}%</Badge>}
                  </td>
                  <td>
                    {producto.stock}
                    {producto.stock <= producto.stockCritico && <Badge bg="warning" text="dark" className="ms-1">Crítico</Badge>}
                  </td>
                  <td className="text-nowrap">
                    {puedeEditar && (
                      <>
                        <Link to={`/admin/productos/${producto.id}/editar`} className="btn btn-outline-primary btn-sm me-1"
                          aria-label={`Editar ${producto.nombre}`}>Editar</Link>
                        <Button variant="outline-danger" size="sm" aria-label={`Eliminar ${producto.nombre}`}
                          onClick={() => setAEliminar(producto)}>Eliminar</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ))}
      </EstadoCarga>

      <ModalConfirmar mostrar={!!aEliminar} titulo="Eliminar producto"
        mensaje={`¿Seguro que quieres eliminar "${aEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar} onCancelar={() => setAEliminar(null)} />
    </section>
  );
}

export default ProductosAdmin;
