import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Table } from 'react-bootstrap';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import ModalConfirmar from '../../components/admin/ModalConfirmar.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { eliminarCategoria, listarCategorias } from '../../services/categoriasService.js';

function CategoriasAdmin() {
  const { datos: categorias, cargando, error, recargar } = useDatos(listarCategorias);
  const [aEliminar, setAEliminar] = useState(null);
  const [aviso, setAviso] = useState(null);

  const confirmarEliminar = async () => {
    try {
      await eliminarCategoria(aEliminar.id);
      setAviso({ tipo: 'success', texto: `Categoría "${aEliminar.nombre}" eliminada.` });
      recargar();
    } catch (e) {
      setAviso({ tipo: 'danger', texto: e.message }); // por ejemplo: la categoría aún tiene productos
    } finally {
      setAEliminar(null);
    }
  };

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Categorías</h1>
        <Link to="/admin/categorias/nueva" className="btn btn-primary btn-sm">Nueva categoría</Link>
      </div>
      {aviso && <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)} role="status">{aviso.texto}</Alert>}
      <EstadoCarga cargando={cargando} error={error}>
        {categorias && (
          <Table responsive hover className="align-middle">
            <thead><tr><th>Nombre</th><th>Identificador</th><th /></tr></thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td><code>{c.slug}</code></td>
                  <td className="text-nowrap">
                    <Link to={`/admin/categorias/${c.id}/editar`} className="btn btn-outline-primary btn-sm me-1"
                      aria-label={`Editar ${c.nombre}`}>Editar</Link>
                    <Button variant="outline-danger" size="sm" aria-label={`Eliminar ${c.nombre}`}
                      onClick={() => setAEliminar(c)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </EstadoCarga>
      <ModalConfirmar mostrar={!!aEliminar} titulo="Eliminar categoría"
        mensaje={`¿Seguro que quieres eliminar la categoría "${aEliminar?.nombre}"?`}
        onConfirmar={confirmarEliminar} onCancelar={() => setAEliminar(null)} />
    </section>
  );
}

export default CategoriasAdmin;
