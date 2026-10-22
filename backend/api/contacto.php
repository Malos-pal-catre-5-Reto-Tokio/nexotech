<?php
require __DIR__ . '/config.php';

const REGEX_CORREO_CONTACTO = '/^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i';

try {
    $pdo = db();
    $metodo = $_SERVER['REQUEST_METHOD'];

    // Cualquier visitante puede enviar un mensaje.
    if ($metodo === 'POST') {
        $d = cuerpo_json();
        $nombre = trim((string) ($d['nombre'] ?? ''));
        $correo = strtolower(trim((string) ($d['correo'] ?? '')));
        $comentario = trim((string) ($d['comentario'] ?? ''));

        if ($nombre === '' || mb_strlen($nombre) > 100) error_api('El nombre es obligatorio (máx. 100 caracteres).');
        if (mb_strlen($correo) > 100 || !preg_match(REGEX_CORREO_CONTACTO, $correo)) {
            error_api('El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com.');
        }
        if ($comentario === '' || mb_strlen($comentario) > 500) error_api('El comentario es obligatorio (máx. 500 caracteres).');

        $pdo->prepare('INSERT INTO mensajes_contacto (nombre, correo, comentario) VALUES (?, ?, ?)')
            ->execute([$nombre, $correo, $comentario]);
        responder(['ok' => true], 201);
    }

    // Solo el personal puede leer los mensajes recibidos.
    if ($metodo === 'GET') {
        requerir_rol($pdo, ['admin', 'vendedor']);
        responder($pdo->query('SELECT id, nombre, correo, comentario, creado_en AS creadoEn
                               FROM mensajes_contacto ORDER BY id DESC')->fetchAll());
    }

    error_api('Método no permitido.', 405);
} catch (PDOException $e) {
    error_api('Error de base de datos.', 500);
}
