import { Alert } from 'react-bootstrap';

// Muestra el resultado de "añadir al carrito". No dibuja nada si no hay aviso.
function AvisoCarrito({ aviso, onCerrar }) {
  if (!aviso) return null;
  return (
    <Alert variant={aviso.tipo} dismissible onClose={onCerrar} role="status">
      {aviso.texto}
    </Alert>
  );
}

export default AvisoCarrito;
