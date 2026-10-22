import { screen, fireEvent } from '@testing-library/react';
import Ordenes from './Ordenes.jsx';
import BoletaAdmin from './BoletaAdmin.jsx';
import { renderizarConSesion } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, ORDENES_DE_PRUEBA, USUARIO_ADMIN } from '../../testing/apiFalsa.js';

const ORDEN_COMPLETA = {
  id: 8, codigo: 'ORD-000008', estado: 'pagada', descuento: 0, total: 20000,
  cliente: { nombre: 'Pedro', apellidos: 'Cliente', correo: 'cliente@gmail.com' },
  entrega: { calle: 'Los Crisantemos 1', departamento: '', region: 'Región de Tarapacá', comuna: 'Iquique', indicaciones: '' },
  items: [{ productoId: 1, nombre: 'Mouse', precio: 10000, cantidad: 2, subtotal: 20000 }],
};

describe('Órdenes y boletas (admin)', () => {
  let api;
  afterEach(() => api.restaurar());

  it('lista las órdenes con su cliente, total y estado, y enlaza a la boleta', async () => {
    api = instalarApiFalsa([['ordenes.php', ORDENES_DE_PRUEBA], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<Ordenes />);

    expect(await screen.findByText('ORD-000008')).toBeTruthy();
    expect(screen.getByText('ORD-000007')).toBeTruthy();
    expect(screen.getByText('pagada')).toBeTruthy();
    expect(screen.getByText('fallida')).toBeTruthy();
    const enlaces = screen.getAllByRole('link', { name: 'Ver boleta' });
    expect(enlaces[0].getAttribute('href')).toBe('/admin/ordenes/8');
  });

  it('avisa cuando todavía no hay órdenes', async () => {
    api = instalarApiFalsa([['ordenes.php', []], ['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<Ordenes />);

    expect(await screen.findByText('Aún no hay órdenes.')).toBeTruthy();
  });

  it('la boleta muestra el detalle de la orden y permite imprimirla', async () => {
    api = instalarApiFalsa([['ordenes.php?id=8', ORDEN_COMPLETA], ['auth.php', USUARIO_ADMIN]]);
    const imprimir = spyOn(window, 'print');

    renderizarConSesion(<BoletaAdmin />, { ruta: '/admin/ordenes/8', patron: '/admin/ordenes/:id' });

    expect(await screen.findByText(/Boleta ORD-000008/)).toBeTruthy();
    expect(screen.getByText('Mouse')).toBeTruthy();
    expect(screen.getByTestId('total-orden').textContent).toMatch(/20.000/);
    fireEvent.click(screen.getByRole('button', { name: 'Imprimir boleta' }));
    expect(imprimir).toHaveBeenCalledTimes(1);
  });
});
