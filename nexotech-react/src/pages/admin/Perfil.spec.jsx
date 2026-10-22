import { screen, fireEvent } from '@testing-library/react';
import Perfil from './Perfil.jsx';
import { renderizarConSesion, llamadas } from '../../testing/renderizar.jsx';
import { instalarApiFalsa, USUARIO_ADMIN } from '../../testing/apiFalsa.js';

const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
const guardar = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

describe('Perfil (admin)', () => {
  let api;
  afterEach(() => api.restaurar());

  it('muestra los datos de la cuenta con sesión', async () => {
    api = instalarApiFalsa([['auth.php', USUARIO_ADMIN]]);

    renderizarConSesion(<Perfil />);

    expect(await screen.findByDisplayValue('Admin')).toBeTruthy();
    expect(screen.getByText(/admin@duoc.cl/)).toBeTruthy();
    expect(screen.getByLabelText(/^Región/).value).toBe('Región Metropolitana de Santiago');
  });

  it('guarda los cambios por POST y confirma al usuario', async () => {
    api = instalarApiFalsa([['accion=perfil', { ...USUARIO_ADMIN, nombre: 'Administrador' }], ['auth.php', USUARIO_ADMIN]]);
    renderizarConSesion(<Perfil />);
    await screen.findByDisplayValue('Admin');

    escribir(/^Nombre/, 'Administrador');
    guardar();

    expect(await screen.findByText('Perfil actualizado correctamente.')).toBeTruthy();
    const cuerpo = llamadas(api, 'accion=perfil', 'POST')[0].cuerpo;
    expect(cuerpo.nombre).toBe('Administrador');
    expect(cuerpo.passwordNueva).toBe('');
  });

  it('para cambiar la contraseña exige la actual y que la confirmación coincida', async () => {
    api = instalarApiFalsa([['auth.php', USUARIO_ADMIN]]);
    renderizarConSesion(<Perfil />);
    await screen.findByDisplayValue('Admin');

    escribir(/^Contraseña nueva/, 'nueva1');
    escribir(/^Confirmar nueva/, 'otra');
    guardar();

    expect(screen.getByText('Ingresa tu contraseña actual para cambiarla.')).toBeTruthy();
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy();
    expect(llamadas(api, 'accion=perfil', 'POST').length).toBe(0);
  });

  it('si la contraseña actual es incorrecta muestra el mensaje de la API', async () => {
    api = instalarApiFalsa([['accion=perfil', new Error('La contraseña actual no es correcta.')], ['auth.php', USUARIO_ADMIN]]);
    renderizarConSesion(<Perfil />);
    await screen.findByDisplayValue('Admin');

    escribir(/^Contraseña actual/, 'mala');
    escribir(/^Contraseña nueva/, 'nueva1');
    escribir(/^Confirmar nueva/, 'nueva1');
    guardar();

    expect(await screen.findByText('La contraseña actual no es correcta.')).toBeTruthy();
  });
});
