import { screen } from '@testing-library/react';
import ReportesGenerales from './ReportesGenerales.jsx';
import ReportesProductos from './ReportesProductos.jsx';
import { renderizarConSesion } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, REPORTES_DE_PRUEBA, USUARIO_ADMIN } from '../../testing/apiFalsa.js';

describe('Reportes (admin)', () => {
  let api;
  afterEach(() => api.restaurar());

  it('el reporte general muestra ingresos, órdenes por estado y ventas por día', async () => {
    api = instalarApiFalsa([['reportes.php', REPORTES_DE_PRUEBA], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<ReportesGenerales />);

    expect(await screen.findByText('Ingresos')).toBeTruthy();
    expect(screen.getAllByText(/350.000/).length).toBeGreaterThanOrEqual(2); // métrica y total por estado
    expect(screen.getByText('Pagos fallidos')).toBeTruthy();
    expect(screen.getByText(/90.000/)).toBeTruthy(); // ventas del día
  });

  it('el reporte general indica cuando no hubo ventas recientes', async () => {
    api = instalarApiFalsa([['reportes.php', { ...REPORTES_DE_PRUEBA, ventasPorDia: [] }], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<ReportesGenerales />);

    expect(await screen.findByText('Sin ventas en el período.')).toBeTruthy();
  });

  it('el reporte de productos muestra los más vendidos, el inventario y alerta por stock crítico', async () => {
    api = instalarApiFalsa([['reportes.php', REPORTES_DE_PRUEBA], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<ReportesProductos />);

    expect(await screen.findByText('Mouse ErgoTech')).toBeTruthy();
    expect(screen.getByText('Accesorios')).toBeTruthy();
    expect(screen.getByText(/Hay 2 producto\(s\) con stock crítico/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver listado' }).getAttribute('href')).toBe('/admin/productos/criticos');
  });

  it('el reporte de productos no muestra la alerta si no hay productos críticos', async () => {
    const sinCriticos = { ...REPORTES_DE_PRUEBA, resumen: { ...REPORTES_DE_PRUEBA.resumen, productosCriticos: 0 } };
    api = instalarApiFalsa([['reportes.php', sinCriticos], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<ReportesProductos />);

    await screen.findByText('Mouse ErgoTech');
    expect(screen.queryByText(/stock crítico/)).toBeNull();
  });
});
