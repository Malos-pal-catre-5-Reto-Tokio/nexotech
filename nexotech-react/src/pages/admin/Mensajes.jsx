import { Table } from 'react-bootstrap';
import EstadoCarga from '../../components/admin/EstadoCarga.jsx';
import { useDatos } from '../../hooks/useDatos.js';
import { listarMensajes } from '../../services/contactoService.js';
import { formatearFecha } from '../../utils/formato.js';

// Mensajes que los visitantes enviaron desde el formulario de contacto.
function Mensajes() {
  const { datos: mensajes, cargando, error } = useDatos(listarMensajes);

  return (
    <section>
      <h1 className="h4 mb-3">Mensajes de contacto</h1>
      <EstadoCarga cargando={cargando} error={error}>
        {mensajes && (mensajes.length === 0 ? <p className="text-muted">Todavía no hay mensajes.</p> : (
          <Table responsive hover className="align-top">
            <thead><tr><th>Fecha</th><th>Nombre</th><th>Correo</th><th>Comentario</th></tr></thead>
            <tbody>
              {mensajes.map((m) => (
                <tr key={m.id}>
                  <td className="text-nowrap">{formatearFecha(m.creadoEn)}</td>
                  <td>{m.nombre}</td>
                  <td>{m.correo}</td>
                  <td>{m.comentario}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ))}
      </EstadoCarga>
    </section>
  );
}

export default Mensajes;
