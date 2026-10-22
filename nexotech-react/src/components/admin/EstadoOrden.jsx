import { Badge } from 'react-bootstrap';

const COLORES = { pagada: 'success', fallida: 'danger', pendiente: 'warning' };

function EstadoOrden({ estado }) {
  return <Badge bg={COLORES[estado] ?? 'secondary'}>{estado}</Badge>;
}

export default EstadoOrden;
