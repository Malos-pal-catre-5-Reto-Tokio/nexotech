<?php
require __DIR__ . '/config.php';

try {
    $pdo = db();
    requerir_rol($pdo, ['admin', 'vendedor']);
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') error_api('Método no permitido.', 405);

    $resumen = consultar($pdo, "SELECT
        (SELECT COUNT(*) FROM ordenes WHERE estado = 'pagada')  AS ordenesPagadas,
        (SELECT COUNT(*) FROM ordenes WHERE estado = 'fallida') AS ordenesFallidas,
        (SELECT COALESCE(SUM(total), 0) FROM ordenes WHERE estado = 'pagada') AS ingresos,
        (SELECT COUNT(*) FROM productos) AS productos,
        (SELECT COALESCE(SUM(stock), 0) FROM productos) AS unidadesInventario,
        (SELECT COUNT(*) FROM productos WHERE stock <= stock_critico) AS productosCriticos,
        (SELECT COUNT(*) FROM usuarios) AS usuarios,
        (SELECT COUNT(*) FROM usuarios WHERE creado_en >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS usuariosNuevosMes")[0];

    responder([
        'resumen' => $resumen,
        'masVendidos' => consultar($pdo, "SELECT oi.nombre, SUM(oi.cantidad) AS unidades, SUM(oi.precio * oi.cantidad) AS ingresos
            FROM orden_items oi JOIN ordenes o ON o.id = oi.orden_id
            WHERE o.estado = 'pagada' GROUP BY oi.nombre ORDER BY unidades DESC LIMIT 5"),
        'stockPorCategoria' => consultar($pdo, 'SELECT c.nombre, COUNT(p.id) AS productos, COALESCE(SUM(p.stock), 0) AS unidades
            FROM categorias c LEFT JOIN productos p ON p.categoria_id = c.id GROUP BY c.id, c.nombre ORDER BY c.nombre'),
        'ordenesPorEstado' => consultar($pdo, 'SELECT estado, COUNT(*) AS cantidad, COALESCE(SUM(total), 0) AS total
            FROM ordenes GROUP BY estado ORDER BY estado'),
        'ventasPorDia' => consultar($pdo, "SELECT DATE(creado_en) AS dia, COUNT(*) AS ordenes, SUM(total) AS total
            FROM ordenes WHERE estado = 'pagada' AND creado_en >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(creado_en) ORDER BY dia"),
    ]);
} catch (PDOException $e) {
    error_api('Error de base de datos.', 500);
}
