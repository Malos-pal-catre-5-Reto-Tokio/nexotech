// Opciones de la barra lateral. "roles" indica quién puede verlas (el servidor vuelve a validarlo).
export const MENU_ADMIN = [
  { a: '/admin', texto: 'Dashboard', icono: 'bi-speedometer2', roles: ['admin', 'vendedor'], fin: true },
  { a: '/admin/ordenes', texto: 'Órdenes', icono: 'bi-receipt', roles: ['admin', 'vendedor'] },
  { a: '/admin/productos', texto: 'Productos', icono: 'bi-box-seam', roles: ['admin', 'vendedor'] },
  { a: '/admin/categorias', texto: 'Categorías', icono: 'bi-tags', roles: ['admin'] },
  { a: '/admin/usuarios', texto: 'Usuarios', icono: 'bi-people', roles: ['admin'] },
  { a: '/admin/mensajes', texto: 'Mensajes', icono: 'bi-envelope', roles: ['admin', 'vendedor'] },
  { a: '/admin/reportes', texto: 'Reportes', icono: 'bi-bar-chart', roles: ['admin', 'vendedor'] },
  { a: '/admin/perfil', texto: 'Perfil', icono: 'bi-person-circle', roles: ['admin', 'vendedor'] },
];
