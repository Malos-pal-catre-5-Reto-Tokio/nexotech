export const ROLES_PERSONAL = ['admin', 'vendedor'];

// El personal (administrador y vendedor) accede al panel de administración.
export const esPersonal = (usuario) => !!usuario && ROLES_PERSONAL.includes(usuario.rol);
export const esAdmin = (usuario) => !!usuario && usuario.rol === 'admin';
