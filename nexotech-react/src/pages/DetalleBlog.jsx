import { Link, useParams } from 'react-router-dom';
import { Alert, Breadcrumb } from 'react-bootstrap';
import { BLOGS } from '../data/blogs.js';

function DetalleBlog() {
  const { id } = useParams();
  const blog = BLOGS.find((b) => String(b.id) === id);

  if (!blog) {
    return (
      <>
        <Alert variant="warning">El artículo que buscas no existe.</Alert>
        <Link to="/blogs">Volver a blogs</Link>
      </>
    );
  }

  return (
    <article>
      <Breadcrumb listProps={{ 'aria-label': 'Ruta de navegación' }}>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/blogs' }}>Blogs</Breadcrumb.Item>
        <Breadcrumb.Item active>{blog.caso}</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="h3 mb-3">{blog.titulo}</h1>
      <img src={blog.imagen} alt={blog.alt} className="img-fluid rounded mb-3" style={{ maxHeight: 360 }} />
      {blog.parrafos.map((parrafo, i) => <p key={i}>{parrafo}</p>)}
      <Link to="/blogs" className="btn btn-secondary">Volver a blogs</Link>
    </article>
  );
}

export default DetalleBlog;
