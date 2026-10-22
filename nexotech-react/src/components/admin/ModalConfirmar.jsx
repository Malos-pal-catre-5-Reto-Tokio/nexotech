import { Button, Modal } from 'react-bootstrap';

// Pide confirmación antes de una acción destructiva (eliminar).
function ModalConfirmar({ mostrar, titulo, mensaje, onConfirmar, onCancelar }) {
  return (
    <Modal show={mostrar} onHide={onCancelar} centered animation={false}>
      <Modal.Header closeButton><Modal.Title as="h2" className="h5">{titulo}</Modal.Title></Modal.Header>
      <Modal.Body>{mensaje}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirmar}>Eliminar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalConfirmar;
