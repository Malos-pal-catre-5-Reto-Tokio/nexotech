<?php
require __DIR__ . '/config.php';

function validar_categoria(array $d): array {
    $slug = strtolower(trim($d['slug'] ?? ''));
    $nombre = trim($d['nombre'] ?? '');
    if (!preg_match('/^[a-z0-9-]{2,40}$/', $slug)) error_api('El identificador (slug) debe tener 2-40 letras minúsculas, números o guiones.');
    if ($nombre === '' || mb_strlen($nombre) > 60) error_api('El nombre es obligatorio (máx. 60 caracteres).');
    return [$slug, $nombre];
}

try {
    $pdo = db();
    $id = id_solicitado();

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            responder($pdo->query('SELECT id, slug, nombre FROM categorias ORDER BY nombre')->fetchAll());

        case 'POST':
            requerir_rol($pdo, ['admin']);
            [$slug, $nombre] = validar_categoria(cuerpo_json());
            $pdo->prepare('INSERT INTO categorias (slug, nombre) VALUES (?, ?)')->execute([$slug, $nombre]);
            responder(['id' => (int) $pdo->lastInsertId(), 'slug' => $slug, 'nombre' => $nombre], 201);

        case 'PUT':
            requerir_rol($pdo, ['admin']);
            if (!$id) error_api('Falta el id.');
            [$slug, $nombre] = validar_categoria(cuerpo_json());
            $pdo->prepare('UPDATE categorias SET slug = ?, nombre = ? WHERE id = ?')->execute([$slug, $nombre, $id]);
            responder(['id' => $id, 'slug' => $slug, 'nombre' => $nombre]);

        case 'DELETE':
            requerir_rol($pdo, ['admin']);
            if (!$id) error_api('Falta el id.');
            $pdo->prepare('DELETE FROM categorias WHERE id = ?')->execute([$id]);
            responder(['eliminado' => $id]);

        default:
            error_api('Método no permitido.', 405);
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000') error_api('No se puede completar: el slug ya existe o la categoría tiene productos.', 409);
    error_api('Error de base de datos.', 500);
}
