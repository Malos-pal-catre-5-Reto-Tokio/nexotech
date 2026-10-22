import { screen, fireEvent, within } from '@testing-library/react';
import UsuariosAdmin from './UsuariosAdmin.jsx';
import FormUsuario from './FormUsuario.jsx';
import HistorialUsuario from './HistorialUsuario.jsx';
import { renderizarConSesion, llamadas } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, ORDENES_DE_PRUEBA, USUARIO_ADMIN, USUARIO_CLIENTE } from '../../testing/apiFalsa.js';

const USUARIOS = [USUARIO_ADMIN, USUARIO_CLIENTE];
const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
const guardar = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
const LISTA = <p>Lista de usuarios</p>;

describe('Usuarios (admin)', () => {
  let api;
  afterEach(() => api.restaurar());

  describe('listado', () => {
    it('muestra los usuarios con su rol y no permite eliminar la propia cuenta', async () => {
      api = instalarApiFalsa([['usuarios.php', USUARIOS], ['auth.php', USUARIO_ADMIN]]);

      renderizarConSesion(<UsuariosAdmin />, { roles: ['admin'] });

      expect(await screen.findByText('cliente@gmail.com')).toBeTruthy();
      expect(screen.getByText('cliente')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Eliminar Pedro' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Eliminar Admin' })).toBeNull(); // es la cuenta con sesión
    });

    it('elimina un usuario después de confirmar', async () => {
      api = instalarApiFalsa([['usuarios.php?id=3', { eliminado: 3 }], ['usuarios.php', USUARIOS], ['auth.php', USUARIO_ADMIN]]);
      renderizarConSesion(<UsuariosAdmin />, { roles: ['admin'] });

      fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Pedro' }));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));

      expect(await screen.findByText('Usuario "Pedro" eliminado.')).toBeTruthy();
      expect(llamadas(api, 'usuarios.php?id=3', 'DELETE').length).toBe(1);
    });

    it('cancelar la confirmación no elimina y si la API rechaza la eliminación muestra el motivo', async () => {
      api = instalarApiFalsa([
        ['usuarios.php?id=3', new Error('No puedes eliminar tu propia cuenta.')], ['usuarios.php', USUARIOS], ['auth.php', USUARIO_ADMIN],
      ]);
      renderizarConSesion(<UsuariosAdmin />, { roles: ['admin'] });

      fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Pedro' }));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));
      expect(llamadas(api, 'usuarios.php?id=3', 'DELETE').length).toBe(0);

      fireEvent.click(screen.getByRole('button', { name: 'Eliminar Pedro' }));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));
      expect(await screen.findByText('No puedes eliminar tu propia cuenta.')).toBeTruthy();
    });

    it('el aviso del resultado se puede cerrar', async () => {
      api = instalarApiFalsa([['usuarios.php?id=3', { eliminado: 3 }], ['usuarios.php', USUARIOS], ['auth.php', USUARIO_ADMIN]]);
      renderizarConSesion(<UsuariosAdmin />, { roles: ['admin'] });
      fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Pedro' }));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));
      await screen.findByText('Usuario "Pedro" eliminado.');

      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      expect(screen.queryByText('Usuario "Pedro" eliminado.')).toBeNull();
    });

    it('enlaza al historial de compras y a la edición de cada usuario', async () => {
      api = instalarApiFalsa([['usuarios.php', USUARIOS], ['auth.php', USUARIO_ADMIN]]);

      renderizarConSesion(<UsuariosAdmin />, { roles: ['admin'] });

      const historial = await screen.findByRole('link', { name: 'Historial de Pedro' });
      expect(historial.getAttribute('href')).toBe('/admin/usuarios/3/historial');
      expect(screen.getByRole('link', { name: 'Editar Pedro' }).getAttribute('href')).toBe('/admin/usuarios/3/editar');
    });
  });

  describe('formulario', () => {
    const nuevo = { patron: '/admin/usuarios/nuevo', ruta: '/admin/usuarios/nuevo', roles: ['admin'] };

    it('al crear exige todos los datos, incluida la contraseña', async () => {
      api = instalarApiFalsa([['auth.php', USUARIO_ADMIN]]);
      renderizarConSesion(<FormUsuario />, nuevo);
      await screen.findByRole('button', { name: 'Guardar' });

      guardar();

      expect(screen.getByText(/RUN inválido/)).toBeTruthy();
      expect(screen.getByText(/La contraseña debe tener entre 4 y 10/)).toBeTruthy();
      expect(screen.getByText('Selecciona una región.')).toBeTruthy();
      expect(llamadas(api, 'usuarios.php', 'POST').length).toBe(0);
    });

    it('un usuario válido se envía con el rol elegido y vuelve al listado', async () => {
      api = instalarApiFalsa([['usuarios.php', { id: 10 }], ['auth.php', USUARIO_ADMIN]]);
      renderizarConSesion(<FormUsuario />, { ...nuevo, extra: [['/admin/usuarios', LISTA]] });
      await screen.findByRole('button', { name: 'Guardar' });

      escribir(/^RUN/, '19011022k');
      escribir(/^Nombre/, 'Laura');
      escribir(/^Apellidos/, 'Soto');
      escribir(/^Correo/, 'laura@duoc.cl');
      escribir(/^Rol/, 'vendedor');
      escribir(/^Contraseña/, 'clave1');
      escribir(/^Región/, 'Región de Tarapacá');
      escribir(/^Comuna/, 'Iquique');
      escribir(/^Dirección/, 'Calle 1');
      guardar();

      expect(await screen.findByText('Lista de usuarios')).toBeTruthy();
      const cuerpo = llamadas(api, 'usuarios.php', 'POST')[0].cuerpo;
      expect(cuerpo.run).toBe('19011022K');
      expect(cuerpo.rol).toBe('vendedor');
      expect(cuerpo.password).toBe('clave1');
    });

    it('al editar la contraseña es opcional y se cargan los datos actuales', async () => {
      api = instalarApiFalsa([
        ['usuarios.php?id=3', (url, op) => (op?.method === 'PUT' ? USUARIO_CLIENTE : USUARIO_CLIENTE)],
        ['auth.php', USUARIO_ADMIN],
      ]);
      renderizarConSesion(<FormUsuario />, {
        patron: '/admin/usuarios/:id/editar', ruta: '/admin/usuarios/3/editar', roles: ['admin'], extra: [['/admin/usuarios', LISTA]],
      });

      expect(await screen.findByDisplayValue('cliente@gmail.com')).toBeTruthy();
      escribir(/^Nombre/, 'Pedro Pablo');
      guardar(); // sin tocar la contraseña

      expect(await screen.findByText('Lista de usuarios')).toBeTruthy();
      const put = llamadas(api, 'usuarios.php?id=3', 'PUT')[0];
      expect(put.cuerpo.nombre).toBe('Pedro Pablo');
      expect(put.cuerpo.password).toBe('');
    });

    it('si el correo ya existe muestra el mensaje de la API', async () => {
      api = instalarApiFalsa([['usuarios.php', new Error('Ya existe un usuario con ese correo o RUN.')], ['auth.php', USUARIO_ADMIN]]);
      renderizarConSesion(<FormUsuario />, nuevo);
      await screen.findByRole('button', { name: 'Guardar' });
      escribir(/^RUN/, '19011022K');
      escribir(/^Nombre/, 'Laura');
      escribir(/^Apellidos/, 'Soto');
      escribir(/^Correo/, 'laura@duoc.cl');
      escribir(/^Contraseña/, 'clave1');
      escribir(/^Región/, 'Región de Tarapacá');
      escribir(/^Comuna/, 'Iquique');
      escribir(/^Dirección/, 'Calle 1');

      guardar();

      expect(await screen.findByText('Ya existe un usuario con ese correo o RUN.')).toBeTruthy();
    });
  });

  describe('historial de compras', () => {
    const ruta = { patron: '/admin/usuarios/:id/historial', ruta: '/admin/usuarios/3/historial', roles: ['admin'] };

    it('muestra las compras del usuario con enlace a cada boleta', async () => {
      api = instalarApiFalsa([
        ['usuarios.php?id=3', USUARIO_CLIENTE], ['ordenes.php?usuario=3', [ORDENES_DE_PRUEBA[0]]], ['auth.php', USUARIO_ADMIN],
      ]);

      renderizarConSesion(<HistorialUsuario />, ruta);

      expect(await screen.findByText(/Historial de compras de Pedro/)).toBeTruthy();
      expect(screen.getByText('ORD-000008')).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Ver boleta' }).getAttribute('href')).toBe('/admin/ordenes/8');
    });

    it('avisa cuando el usuario no tiene compras', async () => {
      api = instalarApiFalsa([['usuarios.php?id=3', USUARIO_CLIENTE], ['ordenes.php?usuario=3', []], ['auth.php', USUARIO_ADMIN]]);

      renderizarConSesion(<HistorialUsuario />, ruta);

      expect(await screen.findByText('Este usuario aún no tiene compras.')).toBeTruthy();
    });
  });
});
