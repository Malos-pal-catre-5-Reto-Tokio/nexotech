import { peticion } from './api.js';

export const obtenerReportes = () => peticion('reportes.php');
