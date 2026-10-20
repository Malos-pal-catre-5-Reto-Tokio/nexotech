<?php
require __DIR__ . '/config.php';

const REGEX_CORREO = '/^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i';
const REGEX_RUN = '/^[0-9]{6,8}[0-9kK]$/';
const PASSWORD_MIN = 4;
const PASSWORD_MAX = 10;

function texto(array $d, string $clave, string $etiqueta, int $max): string {
    $valor = trim((string) ($d[$clave] ?? ''));
    if ($valor === '' || mb_strlen($valor) > $max) error_api("$etiqueta es obligatorio (máx. $max caracteres).");
    return $valor;
}

function validar_registro(array $d): array {
    $run = strtoupper(trim((string) ($d['run'] ?? '')));
    if (!preg_match(REGEX_RUN, $run)) error_api('El RUN no es válido (sin puntos ni guion, ej: 19011022K).');
    $nombre = texto($d, 'nombre', 'El nombre', 50);
    $apellidos = texto($d, 'apellidos', 'Los apellidos', 100);
    $correo = strtolower(trim((string) ($d['correo'] ?? '')));
    if (mb_strlen($correo) > 100 || !preg_match(REGEX_CORREO, $correo)) {
        error_api('El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.');
    }
    $password = (string) ($d['password'] ?? '');
    if (mb_strlen($password) < PASSWORD_MIN || mb_strlen($password) > PASSWORD_MAX) {
        error_api('La contraseña debe tener entre ' . PASSWORD_MIN . ' y ' . PASSWORD_MAX . ' caracteres.');
    }
    $region = texto($d, 'region', 'La región', 80);
    $comuna = texto($d, 'comuna', 'La comuna', 60);
    $direccion = texto($d, 'direccion', 'La dirección', 150);
    return [$run, $nombre, $apellidos, $correo, $password, $region, $comuna, $direccion];
}

try {
    $pdo = db();
    iniciar_sesion();
    $metodo = $_SERVER['REQUEST_METHOD'];

    // GET: quién tiene la sesión iniciada (null si nadie).
    if ($metodo === 'GET') {
        responder(usuario_actual($pdo));
    }
    if ($metodo !== 'POST') error_api('Método no permitido.', 405);

    switch ($_GET['accion'] ?? '') {
        case 'login':
            $d = cuerpo_json();
            $correo = strtolower(trim((string) ($d['correo'] ?? '')));
            $password = (string) ($d['password'] ?? '');
            if ($correo === '' || $password === '') error_api('Ingresa tu correo y contraseña.');

            $st = $pdo->prepare('SELECT id, password_hash FROM usuarios WHERE correo = ?');
            $st->execute([$correo]);
            $fila = $st->fetch();
            // Mismo mensaje si el correo no existe o la contraseña es incorrecta (no revela qué cuentas existen).
            if (!$fila || !password_verify($password, $fila['password_hash'])) {
                error_api('Correo o contraseña incorrectos.', 401);
            }
            session_regenerate_id(true); // evita fijación de sesión
            $_SESSION['usuario_id'] = (int) $fila['id'];
            responder(usuario_actual($pdo));

        case 'registro':
            [$run, $nombre, $apellidos, $correo, $password, $region, $comuna, $direccion] = validar_registro(cuerpo_json());
            $pdo->prepare('INSERT INTO usuarios (run, nombre, apellidos, correo, password_hash, rol, region, comuna, direccion)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
                ->execute([$run, $nombre, $apellidos, $correo, password_hash($password, PASSWORD_DEFAULT),
                           'cliente', $region, $comuna, $direccion]); // el rol nunca viene del navegador
            session_regenerate_id(true);
            $_SESSION['usuario_id'] = (int) $pdo->lastInsertId();
            responder(usuario_actual($pdo), 201);

        case 'logout':
            $_SESSION = [];
            session_destroy();
            responder(['ok' => true]);

        default:
            error_api('Acción no válida.');
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000') error_api('Ya existe una cuenta con ese correo o RUN.', 409);
    error_api('Error de base de datos.', 500);
}
