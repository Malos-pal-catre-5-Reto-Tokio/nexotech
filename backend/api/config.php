<?php
// Configuración común de la API de NexoTech (XAMPP: usuario root sin contraseña por defecto).
const DB_HOST = 'localhost';
const DB_NAME = 'nexotech';
const DB_USER = 'root';
const DB_PASS = '';

header('Content-Type: application/json; charset=utf-8');
// En desarrollo Vite usa un proxy, pero se permite el origen por si se llama directo.
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // así los enteros llegan como números en el JSON
            ]
        );
    }
    return $pdo;
}

function responder($datos, int $codigo = 200): void {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function error_api(string $mensaje, int $codigo = 400): void {
    responder(['error' => $mensaje], $codigo);
}

function cuerpo_json(): array {
    $datos = json_decode(file_get_contents('php://input'), true);
    return is_array($datos) ? $datos : [];
}

function id_solicitado(): ?int {
    return isset($_GET['id']) ? (int) $_GET['id'] : null;
}

// ---- Sesión de usuario (cookie PHPSESSID) y control de roles ----

function iniciar_sesion(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,          // dura hasta cerrar el navegador
            'path'     => '/',
            'httponly' => true,       // JavaScript no puede leer la cookie
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

// Devuelve el usuario con sesión iniciada (sin contraseña) o null.
function usuario_actual(PDO $pdo): ?array {
    iniciar_sesion();
    if (empty($_SESSION['usuario_id'])) return null;
    $st = $pdo->prepare('SELECT id, run, nombre, apellidos, correo, rol, region, comuna, direccion
                         FROM usuarios WHERE id = ?');
    $st->execute([$_SESSION['usuario_id']]);
    return $st->fetch() ?: null;
}

// Corta la petición con 401/403 si no hay sesión o el rol no está permitido.
function requerir_rol(PDO $pdo, array $roles): array {
    $usuario = usuario_actual($pdo);
    if (!$usuario) error_api('Debes iniciar sesión.', 401);
    if (!in_array($usuario['rol'], $roles, true)) error_api('No tienes permisos para esta acción.', 403);
    return $usuario;
}

// ---- Consultas para listados y reportes ----

// Convierte a número los valores que MySQL devuelve como texto numérico (por ejemplo los resultados de SUM).
function numerizar(array $fila): array {
    foreach ($fila as $clave => $valor) {
        if (is_string($valor) && preg_match('/^-?\d+$/', $valor)) $fila[$clave] = (int) $valor;
    }
    return $fila;
}

function consultar(PDO $pdo, string $sql, array $params = []): array {
    $st = $pdo->prepare($sql);
    $st->execute($params);
    return array_map('numerizar', $st->fetchAll());
}
