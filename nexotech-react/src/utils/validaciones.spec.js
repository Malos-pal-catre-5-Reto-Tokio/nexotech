import {
  validarCheckout, esCorreoValido, validarLogin, validarRegistro, esCorreoPermitido, validarContacto,
  validarProducto, validarCategoria, validarUsuarioAdmin, validarPerfil,
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

describe('validación de contacto', () => {
  const valido = { nombre: 'Pedro Pérez', correo: 'pedro@gmail.com', comentario: 'Hola, tengo una consulta.' };

  it('un mensaje completo no genera errores', () => {
    expect(validarContacto(valido)).toEqual({});
  });

  it('marca como obligatorios los campos vacíos', () => {
    expect(Object.keys(validarContacto({})).sort()).toEqual(['comentario', 'correo', 'nombre']);
  });

  it('limita el comentario a 500 caracteres y exige un correo permitido', () => {
    expect(validarContacto({ ...valido, comentario: 'x'.repeat(501) }).comentario).toBe('Máximo 500 caracteres.');
    expect(validarContacto({ ...valido, correo: 'pedro@hotmail.com' }).correo).toBeDefined();
  });
});

describe('validaciones del panel de administración', () => {
  const producto = { codigo: 'AC-1', nombre: 'Mouse', precio: '1000', stock: '5', stockCritico: '2', descuento: '10', categoriaId: '3' };
  const usuario = {
    run: '19011022K', nombre: 'Laura', apellidos: 'Soto', correo: 'laura@duoc.cl', rol: 'vendedor',
    password: 'clave1', region: 'Región de Tarapacá', comuna: 'Iquique', direccion: 'Calle 1',
  };

  it('un producto completo no genera errores', () => {
    expect(validarProducto(producto)).toEqual({});
  });

  it('el producto rechaza números negativos o decimales y descuentos sobre 90', () => {
    const errores = validarProducto({ ...producto, precio: '-5', stock: '1.5', descuento: '91', categoriaId: '' });

    expect(Object.keys(errores).sort()).toEqual(['categoriaId', 'descuento', 'precio', 'stock']);
  });

  it('la categoría exige un identificador válido y un nombre', () => {
    expect(validarCategoria({ slug: 'notebooks', nombre: 'Notebooks' })).toEqual({});
    expect(validarCategoria({ slug: 'Con Espacio', nombre: '' })).toEqual({
      slug: 'Entre 2 y 40 caracteres: minúsculas, números o guiones.', nombre: 'El nombre es obligatorio.',
    });
  });

  it('el usuario nuevo exige contraseña, pero al editar es opcional', () => {
    const sinClave = { ...usuario, password: '' };

    expect(validarUsuarioAdmin(sinClave, { creando: true }).password).toBeDefined();
    expect(validarUsuarioAdmin(sinClave, { creando: false }).password).toBeUndefined();
    expect(validarUsuarioAdmin({ ...usuario, password: 'abc' }, { creando: false }).password).toBeDefined();
  });

  it('el usuario valida rol, correo permitido y RUN', () => {
    const errores = validarUsuarioAdmin({ ...usuario, rol: 'jefe', correo: 'a@hotmail.com', run: '1' }, { creando: true });

    expect(Object.keys(errores).sort()).toEqual(['correo', 'rol', 'run']);
  });

  it('el perfil sin cambio de contraseña solo exige los datos personales', () => {
    const perfil = { nombre: 'Ana', apellidos: 'Pérez', region: 'Región de Tarapacá', comuna: 'Iquique', direccion: 'Calle 1' };

    expect(validarPerfil(perfil)).toEqual({});
    expect(validarPerfil({ ...perfil, nombre: '' }).nombre).toBeDefined();
  });

  it('al cambiar la contraseña el perfil exige la actual y la confirmación', () => {
    const perfil = { nombre: 'Ana', apellidos: 'Pérez', region: 'Región de Tarapacá', comuna: 'Iquique', direccion: 'Calle 1' };
    const errores = validarPerfil({ ...perfil, passwordNueva: 'nueva1', passwordActual: '', confirmarPassword: 'x' });

    expect(errores.passwordActual).toBeDefined();
    expect(errores.confirmarPassword).toBeDefined();
    expect(validarPerfil({ ...perfil, passwordNueva: 'nueva1', passwordActual: 'vieja', confirmarPassword: 'nueva1' })).toEqual({});
  });

  it('todos los formularios rechazan textos que superan el largo máximo permitido', () => {
    const largo = (n) => 'x'.repeat(n);

    expect(validarCheckout({ ...valido, apellidos: largo(101), calle: largo(151), departamento: largo(31) }))
      .toEqual(jasmine.objectContaining({ apellidos: 'Máximo 100 caracteres.', calle: 'Máximo 150 caracteres.', departamento: 'Máximo 30 caracteres.' }));
    expect(validarRegistro({ ...registroValido, nombre: largo(51), apellidos: largo(101), direccion: largo(151) }))
      .toEqual(jasmine.objectContaining({ nombre: 'Máximo 50 caracteres.', apellidos: 'Máximo 100 caracteres.', direccion: 'Máximo 150 caracteres.' }));
    expect(validarContacto({ nombre: largo(101), correo: 'a@gmail.com', comentario: 'ok' }).nombre).toBe('Máximo 100 caracteres.');
    expect(validarCategoria({ slug: 'ok', nombre: largo(61) }).nombre).toBe('Máximo 60 caracteres.');
    expect(validarProducto({ ...producto, codigo: largo(21), nombre: largo(101), descripcion: largo(1001), imagen: largo(256) }))
      .toEqual(jasmine.objectContaining({ codigo: 'Máximo 20 caracteres.', nombre: 'Máximo 100 caracteres.', descripcion: 'Máximo 1000 caracteres.', imagen: 'Máximo 255 caracteres.' }));
    expect(validarUsuarioAdmin({ ...usuario, nombre: largo(51), apellidos: largo(101), direccion: largo(151) }, { creando: true }))
      .toEqual(jasmine.objectContaining({ nombre: 'Máximo 50 caracteres.', apellidos: 'Máximo 100 caracteres.', direccion: 'Máximo 150 caracteres.' }));
    expect(validarPerfil({ nombre: largo(51), apellidos: largo(101), region: 'r', comuna: 'c', direccion: 'd' }))
      .toEqual(jasmine.objectContaining({ nombre: 'Máximo 50 caracteres.', apellidos: 'Máximo 100 caracteres.' }));
  });

  it('el perfil y el stock crítico también se validan cuando faltan datos', () => {
    expect(Object.keys(validarPerfil({ nombre: 'Ana' })).sort()).toEqual(['apellidos', 'comuna', 'direccion', 'region']);
    expect(validarPerfil({ nombre: 'Ana', apellidos: 'P', region: 'r', comuna: 'c', direccion: 'd', passwordNueva: 'abc', passwordActual: 'x', confirmarPassword: 'abc' }).passwordNueva)
      .toBe('La contraseña debe tener entre 4 y 10 caracteres.');
    expect(validarProducto({ ...producto, stockCritico: '' }).stockCritico).toBeDefined();
    expect(validarRegistro({ ...registroValido, correo: 'a@hotmail.com', confirmarCorreo: 'a@hotmail.com' }).correo).toBeDefined();
  });
});
