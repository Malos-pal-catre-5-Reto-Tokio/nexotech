import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Registro from './Registro.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { instalarApiFalsa } from '../testing/apiFalsa.js';

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <AuthProvider>
        <Routes>
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<p>Página de inicio</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
const crear = () => fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
const llamadasRegistro = (api) => api.espia.calls.allArgs().filter(([url]) => url.includes('accion=registro'));

function llenarFormulario() {
  escribir(/RUN/, '19011022k');
  escribir(/^Nombre/, 'Pedro');
  escribir(/Apellidos/, 'Pérez');
  escribir(/^Correo electrónico/, 'pedro@gmail.com');
  escribir(/Confirmar correo/, 'pedro@gmail.com');
  escribir(/^Contraseña/, 'clave123');
  escribir(/Confirmar contraseña/, 'clave123');
  escribir(/Región/, 'Región de Tarapacá');
  escribir(/Comuna/, 'Iquique');
  escribir(/Dirección/, 'Los Crisantemos 123');
}

describe('Registro (página)', () => {
  let api;
  afterEach(() => api.restaurar());

  beforeEach(() => {
    api = instalarApiFalsa([
      ['accion=registro', { id: 9, nombre: 'Pedro', apellidos: 'Pérez', correo: 'pedro@gmail.com', rol: 'cliente' }],
      ['auth.php', null],
    ]);
  });

  it('con el formulario vacío muestra los errores y no llama a la API', async () => {
    renderizar();
    await screen.findByRole('button', { name: 'Crear cuenta' });

    crear();

    expect(screen.getByText(/RUN inválido/)).toBeTruthy();
    expect(screen.getByText('Selecciona una región.')).toBeTruthy();
    expect(llamadasRegistro(api).length).toBe(0);
  });

  it('avisa cuando las contraseñas no coinciden', async () => {
    renderizar();
    await screen.findByRole('button', { name: 'Crear cuenta' });
    llenarFormulario();

    escribir(/Confirmar contraseña/, 'otra');
    crear();

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy();
    expect(llamadasRegistro(api).length).toBe(0);
  });

  it('las comunas dependen de la región elegida', async () => {
    renderizar();
    await screen.findByRole('button', { name: 'Crear cuenta' });
    expect(screen.getByLabelText(/Comuna/).disabled).toBeTrue();

    escribir(/Región/, 'Región de Tarapacá');

    expect(screen.getByRole('option', { name: 'Iquique' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'Arica' })).toBeNull();
  });

  it('un registro válido envía los datos sin la confirmación, deja la sesión iniciada y va al inicio', async () => {
    renderizar();
    await screen.findByRole('button', { name: 'Crear cuenta' });
    llenarFormulario();

    crear();

    expect(await screen.findByText('Página de inicio')).toBeTruthy();
    const cuerpo = JSON.parse(llamadasRegistro(api)[0][1].body);
    expect(cuerpo.run).toBe('19011022K'); // se normaliza a mayúscula
    expect(cuerpo.password).toBe('clave123');
    expect(cuerpo.confirmarPassword).toBeUndefined();
    expect(cuerpo.rol).toBeUndefined(); // el rol lo decide el servidor, nunca el navegador
  });

  it('si el correo ya existe muestra el mensaje de la API', async () => {
    api.restaurar();
    api = instalarApiFalsa([
      ['accion=registro', new Error('Ya existe una cuenta con ese correo o RUN.')],
      ['auth.php', null],
    ]);
    renderizar();
    await screen.findByRole('button', { name: 'Crear cuenta' });
    llenarFormulario();

    crear();

    expect(await screen.findByText('Ya existe una cuenta con ese correo o RUN.')).toBeTruthy();
    expect(screen.queryByText('Página de inicio')).toBeNull();
  });
});
