import { Card, Col, Row } from 'react-bootstrap';

const EQUIPO = [
  { nombre: 'Martin', rol: 'Desarrollador Frontend — Módulo Tienda', foto: '/img/equipo/martin.jpg' },
  { nombre: 'Eidan', rol: 'Desarrollador Frontend — Módulo Administrador', foto: '/img/equipo/eidan.jpg' },
];

function Nosotros() {
  return (
    <section>
      <h1 className="h3 mb-3">Sobre NexoTech</h1>
      <p>
        NexoTech nació en 2020 con un objetivo simple: acercar la tecnología de calidad a todas las personas,
        sin importar su nivel de experiencia. Comenzamos como una pequeña tienda online y hoy contamos con un
        catálogo completo de notebooks, celulares, componentes y accesorios.
      </p>
      <p>
        Nuestro compromiso es ofrecer productos originales, con garantía y un servicio de atención cercano,
        asesorando a cada cliente para que encuentre exactamente lo que necesita.
      </p>

      <h2 className="h4 mt-4 mb-3">Equipo de desarrollo</h2>
      <Row xs={1} sm={2} className="g-3" style={{ maxWidth: 600 }}>
        {EQUIPO.map((persona) => (
          <Col key={persona.nombre}>
            <Card className="h-100 text-center shadow-sm">
              <Card.Img variant="top" src={persona.foto} alt={`Foto de ${persona.nombre}`}
                style={{ objectFit: 'cover', height: 220 }} />
              <Card.Body>
                <Card.Title as="h3" className="h5">{persona.nombre}</Card.Title>
                <Card.Text className="text-muted">{persona.rol}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}

export default Nosotros;
