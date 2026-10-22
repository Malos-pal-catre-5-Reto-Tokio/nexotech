# NexoTech — Backend (PHP + MySQL)

API REST en PHP que usa la tienda React. Pensada para XAMPP (Apache + MySQL/MariaDB).

## Instalación

1. Inicia **Apache** y **MySQL** desde el Panel de Control de XAMPP.
2. En phpMyAdmin (`http://localhost/phpmyadmin`) abre **Importar** y sube `database/nexotech.sql`.
   Crea la base `nexotech`, las tablas y los datos de ejemplo. (Reinicia las tablas si ya existían.)
3. Copia **el contenido** de la carpeta `api/` a `C:\xampp\htdocs\nexotech-api\`
   (los `.php` deben quedar sueltos dentro de `nexotech-api`).
4. Comprueba `http://localhost/nexotech-api/productos.php`: debe mostrar el JSON de los productos.
5. Si tu MySQL tiene otro usuario o contraseña, edítalos al inicio de `api/config.php`.

## Usuarios de demostración

| Correo | Contraseña | Rol |
|---|---|---|
| admin@duoc.cl | admin123 | admin |
| vendedor@duoc.cl | vend123 | vendedor |
| cliente@gmail.com | cliente123 | cliente |

## Endpoints

| Archivo | Métodos | Acceso |
|---|---|---|
| `productos.php` | GET | público |
| `productos.php` | POST, PUT, DELETE | admin |
| `categorias.php` | GET | público |
| `categorias.php` | POST, PUT, DELETE | admin |
| `auth.php` | GET (sesión), POST `?accion=login|registro|logout|perfil` | público / sesión |
| `ordenes.php` | POST (comprar), GET `?id=`, PUT `?id=` (reintentar pago) | dueño de la orden, sesión de compra o personal |
| `ordenes.php` | GET (listado, `?usuario=`) | admin, vendedor |
| `usuarios.php` | GET, POST, PUT, DELETE | admin |
| `reportes.php` | GET | admin, vendedor |
| `contacto.php` | POST | público |
| `contacto.php` | GET | admin, vendedor |

Las carpetas `database/migracion-*.sql` solo sirven para actualizar una base ya importada sin perder datos;
`nexotech.sql` ya incluye todo.
