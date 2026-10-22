<?php
require __DIR__ . '/config.php';

const REGEX_CORREO = '/^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i';
const REGEX_RUN = '/^[0-9]{6,8}[0-9kK]$/';
const ROLES = ['admin', 'vendedor', 'cliente'];
const COLUMNAS = 'id, run, nombre, apellidos, correo, rol, region, comuna, direccion, creado_en AS creadoEn';

function texto(array $d, string $clave, string $etiqueta, int $max): string {
    $valor = trim((string) ($d[$clave] ?? ''));
    if ($valor === '' || mb_strlen($valor) > $max) error_api("$etiqueta es obligatorio (máx. $max caracteres).");
    return $valor;
}

function usuario_por_id(PDO $pdo, int $id): ?array {
    $st = $pdo->prepare('SELECT ' . COLUMNAS . ' FROM usuarios WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

// $creando = true exige contraseña; al editar, la contraseña solo se cambia si se envía una nueva.
function validar_usuario(array $d, bool $creando): array {
    $run = strtoupper(trim((string) ($d['run'] ?? '')));
    if (!preg_match(REGEX_RUN, $run)) error_api('El RUN no es válido (sin puntos ni guion, ej: 19011022K).');
    $correo = strtolower(trim((string) ($d['correo'] ?? '')));
    if (mb_strlen($correo) > 100 || !preg_match(REGEX_CORREO, $correo)) {
        error_api('El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.');
    }
    $rol = (string) ($d['rol'] ?? '');
    if (!in_array($rol, ROLES, true)) error_api('El rol no es válido.');
    $password = (string) ($d['password'] ?? '');
    if (($creando || $password !== '') && (mb_strlen($password) < 4 || mb_strlen($password) > 10)) {
        error_api('La contraseña debe tener entre 4 y 10 caracteres.');
    }
    return [
        'run' => $run, 'nombre' => texto($d, 'nombre', 'El nombre', 50),
        'apellidos' => texto($d, 'apellidos', 'Los apellidos', 100), 'correo' => $correo, 'rol' => $rol,
        'region' => texto($d, 'region', 'La región', 80), 'comuna' => texto($d, 'comuna', 'La comuna', 60),
        'direccion' => texto($d, 'direccion', 'La dirección', 150), 'password' => $password,
    ];
}

try {
    $pdo = db();
    $yo = requerir_rol($pdo, ['admin']); // toda la gestión de usuarios es solo del administrador
    $id = id_solicitado();

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if ($id) {
                $u = usuario_por_id($pdo, $id);
                if (!$u) error_api('Usuario no encontrado.', 404);
                responder($u);
            }
            responder($pdo->query('SELECT ' . COLUMNAS . ' FROM usuarios ORDER BY id')->fetchAll());

        case 'POST':
            $u = validar_usuario(cuerpo_json(), true);
            $pdo->prepare('INSERT INTO usuarios (run, nombre, apellidos, correo, password_hash, rol, region, comuna, direccion)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
                ->execute([$u['run'], $u['nombre'], $u['apellidos'], $u['correo'], password_hash($u['password'], PASSWORD_DEFAULT),
                           $u['rol'], $u['region'], $u['comuna'], $u['direccion']]);
            responder(usuario_por_id($pdo, (int) $pdo->lastInsertId()), 201);

        case 'PUT':
            if (!$id) error_api('Falta el id.');
            if (!usuario_por_id($pdo, $id)) error_api('Usuario no encontrado.', 404);
            $u = validar_usuario(cuerpo_json(), false);
            if ($id === (int) $yo['id'] && $u['rol'] !== 'admin') error_api('No puedes quitarte el rol de administrador.', 409);
            $pdo->prepare('UPDATE usuarios SET run = ?, nombre = ?, apellidos = ?, correo = ?, rol = ?, region = ?, comuna = ?, direccion = ?
                           WHERE id = ?')
                ->execute([$u['run'], $u['nombre'], $u['apellidos'], $u['correo'], $u['rol'], $u['region'], $u['comuna'], $u['direccion'], $id]);
            if ($u['password'] !== '') {
                $pdo->prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?')
                    ->execute([password_hash($u['password'], PASSWORD_DEFAULT), $id]);
            }
            responder(usuario_por_id($pdo, $id));

        case 'DELETE':
            if (!$id) error_api('Falta el id.');
            if ($id === (int) $yo['id']) error_api('No puedes eliminar tu propia cuenta.', 409);
            $pdo->prepare('DELETE FROM usuarios WHERE id = ?')->execute([$id]);
            responder(['eliminado' => $id]);

        default:
            error_api('Método no permitido.', 405);
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000') error_api('Ya existe un usuario con ese correo o RUN.', 409);
    error_api('Error de base de datos.', 500);
}
