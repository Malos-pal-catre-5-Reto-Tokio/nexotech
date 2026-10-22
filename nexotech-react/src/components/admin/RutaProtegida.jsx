import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext.jsx';

// Muestra su contenido solo si hay sesión y el rol está permitido.
// Se usa envolviendo un elemento (children) o como ruta padre (Outlet).
function RutaProtegida({ roles, children }) {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) return <Spinner animation="border" className="m-4" />;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;

  if (!roles.includes(usuario.rol)) {
    return (
      <Alert variant="danger" className="m-4">
        No tienes permisos para ver esta sección. <Link to="/">Volver a la tienda</Link>
      </Alert>
    );
  }
  return children ?? <Outlet />;
}

export default RutaProtegida;
