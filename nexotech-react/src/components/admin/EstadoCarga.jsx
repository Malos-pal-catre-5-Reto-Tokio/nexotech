import { Alert, Spinner } from 'react-bootstrap';

// Muestra un spinner o el error de la API; si todo está bien, dibuja el contenido.
function EstadoCarga({ cargando, error, children }) {
  if (cargando) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  return children;
}

export default EstadoCarga;
