# NexoTech — Tienda Online

Proyecto de la Evaluación Parcial 1 — DSY1104 Desarrollo Fullstack II.
Tienda online de tecnología desarrollada con HTML5, CSS3 y JavaScript.

## Integrantes
- Martin — módulo Tienda (público) y lógica de carrito
- Eidan — módulo Administrador, Blogs, Contacto y validaciones

## Estructura del proyecto
- `/tienda` — vistas públicas (home, productos, login, registro, carrito, nosotros, blogs, contacto)
- `/admin` — panel administrador (gestión de productos y usuarios)
- `/css` — hojas de estilo (variables, base, tienda, admin)
- `/js` — lógica, validaciones y datos simulados
- `/img` — recursos gráficos

## Cómo ejecutar el proyecto
1. Clonar el repositorio.
2. Abrir la carpeta en VS Code.
3. Abrir `tienda/index.html` con la extensión Live Server.

## Roles del sistema
- **Administrador**: acceso total al sistema.
- **Vendedor**: visualiza productos y órdenes (el panel simula este rol desde un selector en la topbar).
- **Cliente**: acceso solo a la tienda.

## Validaciones implementadas
- Login y registro: correo (@duoc.cl, @profesor.duoc.cl, @gmail.com), contraseña (4-10 caracteres), RUN válido.
- Contacto: nombre, correo, comentario (máx. 500 caracteres).
- Producto: código, nombre, precio, stock, stock crítico, categoría.
- Usuario (admin): RUN, nombre, apellidos, correo, región/comuna dependientes, dirección.

## Tecnologías
HTML5, CSS3 (Flexbox/Grid), JavaScript vanilla, localStorage, Git/GitHub.
