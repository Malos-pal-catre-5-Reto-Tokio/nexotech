import { Form } from 'react-bootstrap';

// Campo de formulario con etiqueta, marca de obligatorio y mensaje de error de validación.
function CampoTexto({ id, etiqueta, valor, onChange, error, tipo = 'text', requerido = true, ...extra }) {
  return (
    <Form.Group controlId={id} className="mb-3">
      <Form.Label>{etiqueta}{requerido && <span className="text-danger"> *</span>}</Form.Label>
      <Form.Control type={tipo} value={valor} onChange={onChange} isInvalid={!!error} {...extra} />
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </Form.Group>
  );
}

export default CampoTexto;
