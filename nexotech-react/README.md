# NexoTech — Frontend (React)

Tienda online de tecnología (notebooks, celulares, componentes y accesorios) con panel de administración.
Proyecto de la **Evaluación Parcial 2** de **DSY1104 Desarrollo Fullstack II** (Duoc UC).

Este repositorio contiene el frontend en **React**. Consume una API en PHP con base de datos MySQL
(carpeta `backend/` del proyecto, ver [Backend](#backend-php--mysql)).

## Tecnologías

| Área | Tecnología |
|---|---|
| Interfaz | React 19, React Router 7 |
| Diseño responsivo | Bootstrap 5.3, React-Bootstrap 2.10, Bootstrap Icons |
| Herramientas | Vite 8 (servidor de desarrollo y compilación) |
| Backend | PHP 7.3 o superior (Apache de XAMPP), MySQL / MariaDB, phpMyAdmin |
| Pruebas | Jasmine 5, Karma 6, Testing Library 16, webpack 5, Babel, istanbul |

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior.
- [XAMPP](https://www.apachefriends.org/) con **Apache** y **MySQL** encendidos.
- Un navegador basado en Chromium (Chrome o Edge) para las pruebas.

## Instalación y ejecución

### 1. Backend (una sola vez)

1. En phpMyAdmin (`http://localhost/phpmyadmin`) abre **Importar** y sube `backend/database/nexotech.sql`.
2. Copia **el contenido** de `backend/api/` a `C:\xampp\htdocs\nexotech-api\`
   (los archivos `.php` deben quedar sueltos dentro de `nexotech-api`).
3. Comprueba que `http://localhost/nexotech-api/productos.php` muestre el JSON de los productos.

### 2. Frontend

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Durante el desarrollo, Vite redirige las peticiones de `/api` hacia `http://localhost/nexotech-api`
(ver `vite.config.js`). Así el navegador ve un único origen y la cookie de sesión funciona sin más
configuración. Si Apache usa otro puerto, cambia el `target` en ese archivo y reinicia `npm run dev`.

## Usuarios de demostración

| Correo | Contraseña | Rol |
|---|---|---|
| admin@duoc.cl | admin123 | Administrador |
| vendedor@duoc.cl | vend123 | Vendedor |
| cliente@gmail.com | cliente123 | Cliente |

El **registro público** siempre crea cuentas de cliente. Las cuentas de administrador o vendedor las crea
un administrador desde **Panel → Usuarios**.

Cupón de descuento de prueba: `NEXO10` (10% sobre el subtotal).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión compilada |
| `npm test` | Ejecuta todas las pruebas una vez y muestra la cobertura |
| `npm run test:watch` | Ejecuta las pruebas y las repite al guardar cambios |

## Rutas

### Tienda

| Ruta | Página |
|---|---|
| `/` | Inicio con ofertas y destacados |
| `/productos` | Catálogo con filtro por categoría y búsqueda |
| `/productos/:id` | Detalle de producto |
| `/categorias`, `/categorias/:slug` | Categorías y sus productos |
| `/ofertas` | Productos con descuento |
| `/carrito` | Carrito de compras y cupón |
| `/checkout` | Datos de entrega y pago (simulado) |
| `/compra/exitosa/:id`, `/compra/error/:id` | Resultado de la compra |
| `/login`, `/registro` | Inicio de sesión y registro |
| `/nosotros`, `/blogs`, `/blogs/:id`, `/contacto` | Información, blog y formulario de contacto |

### Panel de administración (`/admin`, requiere sesión de administrador o vendedor)

| Ruta | Sección | Rol |
|---|---|---|
| `/admin` | Dashboard | admin, vendedor |
| `/admin/ordenes`, `/admin/ordenes/:id` | Órdenes y boletas | admin, vendedor |
| `/admin/productos` (+ `/criticos`, `/reportes`) | Productos, stock crítico y reportes | admin, vendedor (lectura) |
| `/admin/productos/nuevo`, `/admin/productos/:id/editar` | Crear y editar productos | admin |
| `/admin/categorias` (+ `/nueva`, `/:id/editar`) | Categorías | admin |
| `/admin/usuarios` (+ `/nuevo`, `/:id/editar`, `/:id/historial`) | Usuarios e historial de compras | admin |
| `/admin/mensajes` | Mensajes de contacto | admin, vendedor |
| `/admin/reportes` | Reportes generales | admin, vendedor |
| `/admin/perfil` | Perfil propio | admin, vendedor |

## Estructura del proyecto

```
src/
├── pages/          Una página por ruta (pages/admin/ para el panel)
├── components/     Componentes reutilizables
│   ├── layout/     Barra de navegación, pie de página y estructura general
│   ├── productos/  Tarjeta de producto, lista, avisos
│   ├── forms/      Campo de texto y selector región-comuna
│   ├── checkout/   Detalle de una orden
│   └── admin/      Menú lateral, ruta protegida, modal de confirmación
├── context/        Estado global: CarritoContext (carrito) y AuthContext (sesión)
├── hooks/          Carga de datos: useProductos, useCategorias, useOrden, useDatos...
├── services/       Llamadas a la API (un archivo por recurso)
├── utils/          Funciones puras: precios, validaciones, roles, fechas
├── data/           Regiones y comunas, artículos del blog
├── testing/        Utilidades de prueba (API falsa, renderizado con sesión)
└── public/img/     Imágenes servidas como /img/...
```

Cada archivo de prueba (`*.spec.js` / `*.spec.jsx`) está junto al código que prueba.

**Decisiones de diseño:**

- Cada componente tiene una sola responsabilidad. Los componentes de presentación reciben datos y acciones
  por **props**; el **estado** local se usa para formularios y avisos, y el estado compartido (carrito y
  sesión) vive en contextos.
- La lógica de acceso a datos está en `services/` y `hooks/`, y las validaciones son funciones puras en
  `utils/`, lo que facilita probarlas.
- El diseño es responsivo con la grilla de Bootstrap (1 columna en móvil, 2 en tablet y 4 en escritorio).

## Pruebas

El proceso de pruebas usa **Jasmine** (marco de pruebas) y **Karma** (ejecutor en el navegador), con
**Testing Library** para renderizar componentes y simular eventos, y **istanbul** para medir la cobertura.

```bash
npm test
```

- Ninguna prueba usa la red ni la base de datos: `window.fetch`, `localStorage` y las funciones recibidas
  por props se reemplazan por **mocks** (ver `src/testing/apiFalsa.js`).
- Al terminar se genera la carpeta `coverage/` con un reporte HTML por archivo (`coverage/html/index.html`).
- Estado actual: **191 pruebas** en 42 conjuntos, con 100% de sentencias, funciones y líneas, y 93,3% de ramas.

Si Karma no encuentra el navegador, indica su ruta antes de ejecutar:

```powershell
$env:CHROME_BIN = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
npm test
```

## Backend (PHP + MySQL)

La API vive en `backend/api/` y los datos en `backend/database/nexotech.sql`. Resumen de endpoints:

| Archivo | Métodos | Acceso |
|---|---|---|
| `productos.php`, `categorias.php` | GET | público |
| `productos.php`, `categorias.php` | POST, PUT, DELETE | administrador |
| `auth.php` | GET (sesión), POST `login`, `registro`, `logout`, `perfil` | público / sesión |
| `ordenes.php` | POST (comprar), GET y PUT por `id` | dueño de la orden, sesión de compra o personal |
| `ordenes.php` | GET (listado) | administrador, vendedor |
| `usuarios.php` | GET, POST, PUT, DELETE | administrador |
| `reportes.php` | GET | administrador, vendedor |
| `contacto.php` | POST (público), GET (personal) | según método |

Seguridad: contraseñas con hash bcrypt, sesión con cookie HttpOnly, consultas preparadas (PDO) y control de
acceso por rol validado en el servidor. Más detalles en `backend/README.md`.

## Solución de problemas

| Síntoma | Causa probable y solución |
|---|---|
| `Error 404 al llamar a ... .php` | Los PHP no están en `C:\xampp\htdocs\nexotech-api\` (deben quedar sueltos en esa carpeta). |
| `Error 502 al llamar a ... .php` | Apache está apagado o Vite no lo alcanza. Enciende Apache en XAMPP; si persiste, cambia el `target` de `vite.config.js` a `http://127.0.0.1` y reinicia `npm run dev`. |
| `Error de base de datos.` | MySQL apagado o la base `nexotech` no está importada. Importa `nexotech.sql`. |
| "Correo o contraseña incorrectos" con los usuarios de demostración | La base no tiene los usuarios. Importa `nexotech.sql` de nuevo. |
| `You need to include some adapter...` al correr `npm test` | Karma no leyó `karma.conf.cjs`. El script debe ser `karma start karma.conf.cjs ...`. |
| `Cannot start ChromeHeadless` | Define `CHROME_BIN` con la ruta de Chrome o Edge (ver sección Pruebas). |
| Las imágenes no se ven | Deben estar en `src/public/img/`; `vite.config.js` usa `publicDir: 'src/public'`. |

## Documentación

- **ERS V2** — Especificación de Requisitos del Software (versión 2).
- **Documento de cobertura de testing** — herramientas, estrategia, mocks, resultados y cobertura por archivo.

## Integrantes

Martin y Eidan — DSY1104 Desarrollo Fullstack II, Duoc UC.
