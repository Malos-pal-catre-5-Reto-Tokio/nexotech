// Convierte la fecha de MySQL ("2026-10-19 21:30:00") en texto legible para Chile.
export function formatearFecha(fecha) {
  if (!fecha) return '';
  const date = new Date(String(fecha).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? String(fecha) : date.toLocaleDateString('es-CL');
}
