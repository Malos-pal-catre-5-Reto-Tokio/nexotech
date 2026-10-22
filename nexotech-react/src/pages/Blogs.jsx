import { Link } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import { BLOGS } from '../data/blogs.js';

function Blogs() {
  return (
    <section>
      <h1 className="h3 mb-3">Noticias importantes</h1>
      {BLOGS.map((blog) => (
        <Card key={blog.id} className="mb-3 shadow-sm">
          <Row className="g-0 align-items-center">
            <Col md={8}>
              <Card.Body>
                <Card.Title as="h2" className="h5">{blog.caso}: {blog.titulo}</Card.Title>
                <Card.Text>{blog.resumen}</Card.Text>
                <Link to={`/blogs/${blog.id}`} className="btn btn-secondary">Ver caso</Link>
              </Card.Body>
            </Col>
            <Col md={4}>
              <img src={blog.imagen} alt={blog.caso} className="img-fluid rounded-end w-100"
                style={{ objectFit: 'cover', maxHeight: 220 }} />
            </Col>
          </Row>
        </Card>
      ))}
    </section>
  );
}

export default Blogs;
