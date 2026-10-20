<?php
require __DIR__ . '/config.php';

const SELECT_PRODUCTOS = 'SELECT p.id, p.codigo, p.nombre, p.descripcion, p.precio, p.stock,
        p.stock_critico AS stockCritico, p.imagen, p.descuento_pct AS descuento,
        p.categoria_id AS categoriaId, c.slug AS categoria
    FROM productos p JOIN categorias c ON c.id = p.categoria_id';

function validar_producto(PDO $pdo, array $d): array {
    $codigo = trim($d['codigo'] ?? '');
    $nombre = trim($d['nombre'] ?? '');
    $precio = $d['precio'] ?? null;
    $stock = $d['stock'] ?? null;
    $critico = $d['stockCritico'] ?? 0;
    $descuento = $d['descuento'] ?? 0;
    $categoriaId = (int) ($d['categoriaId'] ?? 0);

    if ($codigo === '' || mb_strlen($codigo) > 20) error_api('El código es obligatorio (máx. 20 caracteres).');
    if ($nombre === '' || mb_strlen($nombre) > 100) error_api('El nombre es obligatorio (máx. 100 caracteres).');
    if (!is_numeric($precio) || $precio < 0) error_api('El precio debe ser un número mayor o igual a 0.');
    if (!is_numeric($stock) || $stock < 0) error_api('El stock debe ser un número mayor o igual a 0.');
    if (!is_numeric($critico) || $critico < 0) error_api('El stock crítico debe ser un número mayor o igual a 0.');
    if (!is_numeric($descuento) || $descuento < 0 || $descuento > 90) error_api('El descuento debe estar entre 0 y 90.');

    $existe = $pdo->prepare('SELECT COUNT(*) FROM categorias WHERE id = ?');
    $existe->execute([$categoriaId]);
    if (!$existe->fetchColumn()) error_api('La categoría indicada no existe.');

    return [$codigo, $nombre, trim($d['descripcion'] ?? ''), (int) $precio, (int) $stock,
            (int) $critico, trim($d['imagen'] ?? ''), (int) $descuento, $categoriaId];
}

function producto_por_id(PDO $pdo, int $id): ?array {
    $st = $pdo->prepare(SELECT_PRODUCTOS . ' WHERE p.id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

try {
    $pdo = db();
    $id = id_solicitado();

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if ($id) {
                $producto = producto_por_id($pdo, $id);
                if (!$producto) error_api('Producto no encontrado.', 404);
                responder($producto);
            }
            // Filtros opcionales: ?categoria=slug  ?oferta=1  ?critico=1  ?q=texto
            $where = [];
            $params = [];
            if (!empty($_GET['categoria'])) { $where[] = 'c.slug = ?'; $params[] = $_GET['categoria']; }
            if (!empty($_GET['oferta']))    { $where[] = 'p.descuento_pct > 0'; }
            if (!empty($_GET['critico']))   { $where[] = 'p.stock <= p.stock_critico'; }
            if (!empty($_GET['q']))         { $where[] = 'p.nombre LIKE ?'; $params[] = '%' . $_GET['q'] . '%'; }
            $sql = SELECT_PRODUCTOS . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY p.id';
            $st = $pdo->prepare($sql);
            $st->execute($params);
            responder($st->fetchAll());

        case 'POST':
            $datos = validar_producto($pdo, cuerpo_json());
            $pdo->prepare('INSERT INTO productos
                (codigo, nombre, descripcion, precio, stock, stock_critico, imagen, descuento_pct, categoria_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')->execute($datos);
            responder(producto_por_id($pdo, (int) $pdo->lastInsertId()), 201);

        case 'PUT':
            if (!$id) error_api('Falta el id.');
            if (!producto_por_id($pdo, $id)) error_api('Producto no encontrado.', 404);
            $datos = validar_producto($pdo, cuerpo_json());
            $datos[] = $id;
            $pdo->prepare('UPDATE productos SET codigo = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?,
                stock_critico = ?, imagen = ?, descuento_pct = ?, categoria_id = ? WHERE id = ?')->execute($datos);
            responder(producto_por_id($pdo, $id));

        case 'DELETE':
            if (!$id) error_api('Falta el id.');
            $pdo->prepare('DELETE FROM productos WHERE id = ?')->execute([$id]);
            responder(['eliminado' => $id]);

        default:
            error_api('Método no permitido.', 405);
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000') error_api('Ya existe un producto con ese código.', 409);
    error_api('Error de base de datos.', 500);
}
