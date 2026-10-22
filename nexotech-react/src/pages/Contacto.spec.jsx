import { render, screen, fireEvent } from '@testing-library/react';
import Contacto from './Contacto.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { instalarApiFalsa } from '../testing/apiFalsa.js';

const renderizar = () => render(<AuthProvider><Contacto /></AuthProvider>);
const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
const enviar = () => fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
const llamadasContacto = (api) => api.espia.calls.allArgs().filter(([url]) => url.includes('contacto.php'));

describe('Contacto (página)', () => {
  let api;
  afterEach(() => api.restaurar());

  it('con el formulario vacío muestra los errores y no llama a la API', async () => {
    api = instalarApiFalsa([['auth.php', null]]);
    renderizar();
    await screen.findByRole('button', { name: 'Enviar mensaje' });

    enviar();

    expect(screen.getByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('El comentario es obligatorio.')).toBeTruthy();
    expect(llamadasContacto(api).length).toBe(0);
  });

  it('un mensaje válido se envía por POST y muestra la confirmación', async () => {
    api = instalarApiFalsa([['contacto.php', { ok: true }], ['auth.php', null]]);
    renderizar();
    await screen.findByRole('button', { name: 'Enviar mensaje' });

    escribir(/Nombre/, 'Pedro Pérez');
    escribir(/Correo/, 'pedro@gmail.com');
    escribir(/Comentario/, 'Quiero cotizar un notebook.');
    enviar();

    expect(await screen.findByText(/Mensaje enviado correctamente/)).toBeTruthy();
    const llamada = llamadasContacto(api)[0];
    expect(llamada[1].method).toBe('POST');
    expect(JSON.parse(llamada[1].body)).toEqual({
      nombre: 'Pedro Pérez', correo: 'pedro@gmail.com', comentario: 'Quiero cotizar un notebook.',
    });
    expect(screen.getByLabelText(/Comentario/).value).toBe(''); // el comentario se limpia
  });

  it('si la API responde con un error lo muestra y conserva lo escrito', async () => {
    api = instalarApiFalsa([['contacto.php', new Error('Error de base de datos.')], ['auth.php', null]]);
    renderizar();
    await screen.findByRole('button', { name: 'Enviar mensaje' });

    escribir(/Nombre/, 'Pedro Pérez');
    escribir(/Correo/, 'pedro@gmail.com');
    escribir(/Comentario/, 'Hola');
    enviar();

    expect(await screen.findByText('Error de base de datos.')).toBeTruthy();
    expect(screen.getByLabelText(/Comentario/).value).toBe('Hola');
  });

  it('con sesión iniciada completa el nombre y el correo', async () => {
    api = instalarApiFalsa([['auth.php', {
      id: 3, nombre: 'Pedro', apellidos: 'Cliente', correo: 'cliente@gmail.com', rol: 'cliente',
    }]]);

    renderizar();

    expect(await screen.findByDisplayValue('Pedro Cliente')).toBeTruthy();
    expect(screen.getByLabelText(/Correo/).value).toBe('cliente@gmail.com');
  });
});
