import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Table } from 'react-bootstrap';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import ModalConfirmar from '../../components/admin/ModalConfirmar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { eliminarUsuario, listarUsuarios } from '../../services/usuariosService.js';

const COLOR_ROL = { admin: 'danger', vendedor: 'primary', cliente: 'secondary' };

function UsuariosAdmin() {
  const { usuario: yo } = useAuth();
  const { datos: usuarios, cargando, error, recargar } = useDatos(listarUsuarios);
  const [aEliminar, setAEliminar] = useState(null);
  const [aviso, setAviso] = useState(null);

  const confirmarEliminar = async () => {
    try {
      await eliminarUsuario(aEliminar.id);
      setAviso({ tipo: 'success', texto: `Usuario "${aEliminar.nombre}" eliminado.` });
      recargar();
    } catch (e) {
      setAviso({ tipo: 'danger', texto: e.message });
    } finally {
      setAEliminar(null);
    }
  };

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Usuarios</h1>
        <Link to="/admin/usuarios/nuevo" className="btn btn-primary btn-sm">Nuevo usuario</Link>
      </div>
      {aviso && <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)} role="status">{aviso.texto}</Alert>}
      <EstadoCarga cargando={cargando} error={error}>
        {usuarios && (
          <Table responsive hover className="align-middle">
            <thead><tr><th>RUN</th><th>Nombre</th><th>Correo</th><th>Rol</th><th /></tr></thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.run}</td>
                  <td>{u.nombre} {u.apellidos}</td>
                  <td>{u.correo}</td>
                  <td><Badge bg={COLOR_ROL[u.rol]}>{u.rol}</Badge></td>
                  <td className="text-nowrap">
                    <Link to={`/admin/usuarios/${u.id}/editar`} className="btn btn-outline-primary btn-sm me-1"
                      aria-label={`Editar ${u.nombre}`}>Editar</Link>
                    <Link to={`/admin/usuarios/${u.id}/historial`} className="btn btn-outline-secondary btn-sm me-1"
                      aria-label={`Historial de ${u.nombre}`}>Historial</Link>
                    {u.id !== yo.id && (
                      <Button variant="outline-danger" size="sm" aria-label={`Eliminar ${u.nombre}`}
                        onClick={() => setAEliminar(u)}>Eliminar</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </EstadoCarga>
      <ModalConfirmar mostrar={!!aEliminar} titulo="Eliminar usuario"
        mensaje={`¿Seguro que quieres eliminar a "${aEliminar?.nombre}"? Sus órdenes se conservan sin usuario asociado.`}
        onConfirmar={confirmarEliminar} onCancelar={() => setAEliminar(null)} />
    </section>
  );
}

export default UsuariosAdmin;
