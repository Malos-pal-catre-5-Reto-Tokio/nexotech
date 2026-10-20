import {
  validarCheckout, esCorreoValido, validarLogin, validarRegistro, esCorreoPermitido,
} from './validaciones.js';

const valido = {
  nombre: 'Pedro', apellidos: 'Pérez', correo: 'pedro@example.com', calle: 'Los Crisantemos 123',
  departamento: '', region: 'Región de Tarapacá', comuna: 'Iquique', indicaciones: '',
};

describe('validaciones', () => {
  it('un formulario completo no genera errores', () => {
    expect(validarCheckout(valido)).toEqual({});
  });

  it('marca como obligatorios los campos vacíos', () => {
    const errores = validarCheckout({ ...valido, nombre: '  ', apellidos: '', correo: '', calle: '', region: '', comuna: '' });

    expect(Object.keys(errores).sort()).toEqual(['apellidos', 'calle', 'comuna', 'correo', 'nombre', 'region']);
  });

  it('rechaza correos mal formados', () => {
    expect(esCorreoValido('pedro@example.com')).toBeTrue();
    expect(esCorreoValido('pedro@')).toBeFalse();
    expect(esCorreoValido('pedro example.com')).toBeFalse();
    expect(validarCheckout({ ...valido, correo: 'sin-arroba' }).correo).toBe('Ingresa un correo válido.');
  });

  it('respeta los largos máximos', () => {
    const errores = validarCheckout({ ...valido, nombre: 'a'.repeat(51), indicaciones: 'x'.repeat(301) });

    expect(errores.nombre).toBe('Máximo 50 caracteres.');
    expect(errores.indicaciones).toBe('Máximo 300 caracteres.');
  });
});

const registroValido = {
  run: '19011022K', nombre: 'Pedro', apellidos: 'Pérez', correo: 'pedro@gmail.com', confirmarCorreo: 'pedro@gmail.com',
  password: 'clave123', confirmarPassword: 'clave123', region: 'Región de Tarapacá', comuna: 'Iquique', direccion: 'Calle 1',
};

describe('validaciones de login y registro', () => {
  it('solo acepta correos de los dominios permitidos', () => {
    expect(esCorreoPermitido('a@duoc.cl')).toBeTrue();
    expect(esCorreoPermitido('a@profesor.duoc.cl')).toBeTrue();
    expect(esCorreoPermitido('a@gmail.com')).toBeTrue();
    expect(esCorreoPermitido('a@hotmail.com')).toBeFalse();
  });

  it('el login exige correo permitido y contraseña', () => {
    expect(validarLogin({ correo: 'a@duoc.cl', password: 'x' })).toEqual({});
    expect(validarLogin({ correo: 'a@hotmail.com', password: '' })).toEqual({
      correo: 'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.',
      password: 'La contraseña es obligatoria.',
    });
  });

  it('un registro completo no genera errores', () => {
    expect(validarRegistro(registroValido)).toEqual({});
  });

  it('valida el formato del RUN', () => {
    expect(validarRegistro({ ...registroValido, run: '12.345.678-9' }).run).toBeDefined();
    expect(validarRegistro({ ...registroValido, run: '123' }).run).toBeDefined();
    expect(validarRegistro({ ...registroValido, run: '12345678k' }).run).toBeUndefined();
  });

  it('exige que correo y contraseña coincidan con su confirmación', () => {
    const errores = validarRegistro({ ...registroValido, confirmarCorreo: 'otro@gmail.com', confirmarPassword: 'distinta' });

    expect(errores.confirmarCorreo).toBe('Los correos no coinciden.');
    expect(errores.confirmarPassword).toBe('Las contraseñas no coinciden.');
  });

  it('exige una contraseña de 4 a 10 caracteres', () => {
    expect(validarRegistro({ ...registroValido, password: 'abc', confirmarPassword: 'abc' }).password).toBeDefined();
    expect(validarRegistro({ ...registroValido, password: 'a'.repeat(11), confirmarPassword: 'a'.repeat(11) }).password).toBeDefined();
  });
});
