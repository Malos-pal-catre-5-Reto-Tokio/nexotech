import { Col, Form } from 'react-bootstrap';
import { REGIONES_COMUNAS } from '../../data/regionesComunas.js';

// Par de selectores dependientes: las comunas disponibles cambian según la región elegida.
function SelectorRegionComuna({ region, comuna, errorRegion, errorComuna, onRegion, onComuna }) {
  const comunas = REGIONES_COMUNAS[region] ?? [];
  return (
    <>
      <Col md={6}>
        <Form.Group controlId="region" className="mb-3">
          <Form.Label>Región<span className="text-danger"> *</span></Form.Label>
          <Form.Select value={region} onChange={onRegion} isInvalid={!!errorRegion}>
            <option value="">-- Seleccione la región --</option>
            {Object.keys(REGIONES_COMUNAS).map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errorRegion}</Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="comuna" className="mb-3">
          <Form.Label>Comuna<span className="text-danger"> *</span></Form.Label>
          <Form.Select value={comuna} onChange={onComuna} isInvalid={!!errorComuna} disabled={!region}>
            <option value="">-- Seleccione la comuna --</option>
            {comunas.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errorComuna}</Form.Control.Feedback>
        </Form.Group>
      </Col>
    </>
  );
}

export default SelectorRegionComuna;
