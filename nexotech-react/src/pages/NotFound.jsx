import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="text-center py-5">
      <h1 className="h3">Página no encontrada</h1>
      <p className="text-muted">La página que buscas no existe o aún no está disponible.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </section>
  );
}

export default NotFound;
