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
