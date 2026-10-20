<?php
require __DIR__ . '/config.php';

const CUPONES = ['NEXO10' => 0.10];

function codigo_orden(int $id): string {
    return 'ORD-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
}

// Devuelve la orden con sus líneas, lista para mostrar la boleta.
function orden_completa(PDO $pdo, int $id): ?array {
    $st = $pdo->prepare('SELECT * FROM ordenes WHERE id = ?');
    $st->execute([$id]);
    $o = $st->fetch();
    if (!$o) return null;

    $st = $pdo->prepare('SELECT producto_id AS productoId, nombre, precio, cantidad
                         FROM orden_items WHERE orden_id = ? ORDER BY id');
    $st->execute([$id]);
    $items = $st->fetchAll();
    foreach ($items as &$item) {
        $item['subtotal'] = $item['precio'] * $item['cantidad'];
    }
    unset($item);

    return [
        'id'        => (int) $o['id'],
        'usuarioId' => $o['usuario_id'] !== null ? (int) $o['usuario_id'] : null,
        'codigo'    => codigo_orden((int) $o['id']),
        'estado'    => $o['estado'],
        'creadoEn'  => $o['creado_en'],
        'cliente'   => ['nombre' => $o['nombre'], 'apellidos' => $o['apellidos'], 'correo' => $o['correo']],
        'entrega'   => ['calle' => $o['calle'], 'departamento' => $o['departamento'], 'region' => $o['region'],
                        'comuna' => $o['comuna'], 'indicaciones' => $o['indicaciones']],
        'items'     => $items,
        'descuento' => (int) $o['descuento'],
        'total'     => (int) $o['total'],
    ];
}

// Una orden la ve su dueño, quien la acaba de crear en esta sesión (compra como invitado) o el personal.
function puede_ver_orden(?array $usuario, int $ordenId, ?int $duenoId): bool {
    if ($usuario && in_array($usuario['rol'], ['admin', 'vendedor'], true)) return true;
    if ($usuario && $duenoId !== null && (int) $usuario['id'] === $duenoId) return true;
    return in_array($ordenId, $_SESSION['ordenes_propias'] ?? [], true);
}

function texto_requerido(array $d, string $clave, string $etiqueta, int $max): string {
    $valor = trim((string) ($d[$clave] ?? ''));
    if ($valor === '' || mb_strlen($valor) > $max) error_api("$etiqueta es obligatorio (máx. $max caracteres).");
    return $valor;
}

function texto_opcional(array $d, string $clave, int $max): string {
    $valor = trim((string) ($d[$clave] ?? ''));
    if (mb_strlen($valor) > $max) error_api("El campo $clave excede los $max caracteres.");
    return $valor;
}

// Reserva el stock de las líneas de una orden (dentro de una transacción) y lo descuenta.
function descontar_stock(PDO $pdo, array $lineas): void {
    foreach ($lineas as $l) {
        $st = $pdo->prepare('SELECT stock, nombre FROM productos WHERE id = ? FOR UPDATE');
        $st->execute([$l['productoId']]);
        $p = $st->fetch();
        if (!$p) throw new RuntimeException('Un producto de la compra ya no existe.');
        if ($p['stock'] < $l['cantidad']) throw new RuntimeException('Stock insuficiente para ' . $p['nombre'] . '.');
        $pdo->prepare('UPDATE productos SET stock = stock - ? WHERE id = ?')->execute([$l['cantidad'], $l['productoId']]);
    }
}

try {
    $pdo = db();
    $id = id_solicitado();
    $metodo = $_SERVER['REQUEST_METHOD'];
    $usuario = usuario_actual($pdo); // también inicia la sesión

    if ($metodo === 'GET') {
        if ($id) {
            $orden = orden_completa($pdo, $id);
            if (!$orden || !puede_ver_orden($usuario, $id, $orden['usuarioId'])) error_api('Orden no encontrada.', 404);
            responder($orden);
        }
        requerir_rol($pdo, ['admin', 'vendedor']); // el listado completo es solo del personal
        $filas = $pdo->query('SELECT id, nombre, apellidos, correo, total, estado, creado_en AS creadoEn
                              FROM ordenes ORDER BY id DESC')->fetchAll();
        foreach ($filas as &$f) $f['codigo'] = codigo_orden((int) $f['id']);
        unset($f);
        responder($filas);
    }

    if ($metodo === 'POST') {
        $d = cuerpo_json();
        $c = $d['cliente'] ?? [];
        $e = $d['entrega'] ?? [];
        $nombre    = texto_requerido($c, 'nombre', 'El nombre', 50);
        $apellidos = texto_requerido($c, 'apellidos', 'Los apellidos', 100);
        $correo    = texto_requerido($c, 'correo', 'El correo', 100);
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) error_api('El correo no es válido.');
        $calle     = texto_requerido($e, 'calle', 'La calle', 150);
        $region    = texto_requerido($e, 'region', 'La región', 80);
        $comuna    = texto_requerido($e, 'comuna', 'La comuna', 60);
        $depto     = texto_opcional($e, 'departamento', 30);
        $indic     = texto_opcional($e, 'indicaciones', 300);

        $pedido = $d['items'] ?? [];
        if (!is_array($pedido) || count($pedido) === 0) error_api('La compra no tiene productos.');
        // "aprobado" / "rechazado" simula el resultado de la pasarela de pago.
        $aprobado = ($d['pago'] ?? 'aprobado') !== 'rechazado';
        $cupon = strtoupper(trim((string) ($d['cupon'] ?? '')));

        $pdo->beginTransaction();
        $lineas = [];
        $subtotal = 0;
        foreach ($pedido as $it) {
            $pid = (int) ($it['id'] ?? 0);
            $cant = (int) ($it['cantidad'] ?? 0);
            if ($pid <= 0 || $cant <= 0) throw new RuntimeException('Hay un producto con datos inválidos.');
            // Los precios se leen de la base de datos: nunca se confía en el precio enviado por el navegador.
            $st = $pdo->prepare('SELECT id, nombre, precio, descuento_pct, stock FROM productos WHERE id = ?');
            $st->execute([$pid]);
            $p = $st->fetch();
            if (!$p) throw new RuntimeException('Un producto de la compra ya no existe.');
            if ($p['stock'] < $cant) throw new RuntimeException('Stock insuficiente para ' . $p['nombre'] . '.');
            $precio = (int) round($p['precio'] * (1 - $p['descuento_pct'] / 100));
            $lineas[] = ['productoId' => $pid, 'nombre' => $p['nombre'], 'precio' => $precio, 'cantidad' => $cant];
            $subtotal += $precio * $cant;
        }
        $descuento = isset(CUPONES[$cupon]) ? (int) round($subtotal * CUPONES[$cupon]) : 0;
        $total = $subtotal - $descuento;

        $pdo->prepare('INSERT INTO ordenes (usuario_id, nombre, apellidos, correo, calle, departamento, region, comuna,
                       indicaciones, descuento, total, estado) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
            ->execute([$usuario['id'] ?? null, $nombre, $apellidos, $correo, $calle, $depto, $region, $comuna, $indic,
                       $descuento, $total, $aprobado ? 'pagada' : 'fallida']);
        $ordenId = (int) $pdo->lastInsertId();
        $_SESSION['ordenes_propias'][] = $ordenId; // permite ver la boleta aunque se compre sin cuenta

        foreach ($lineas as $l) {
            $pdo->prepare('INSERT INTO orden_items (orden_id, producto_id, nombre, precio, cantidad) VALUES (?,?,?,?,?)')
                ->execute([$ordenId, $l['productoId'], $l['nombre'], $l['precio'], $l['cantidad']]);
        }
        if ($aprobado) descontar_stock($pdo, $lineas);

        $pdo->commit();
        responder(orden_completa($pdo, $ordenId), 201);
    }

    if ($metodo === 'PUT') {
        // Reintento de pago de una orden fallida.
        if (!$id) error_api('Falta el id.');
        $pdo->beginTransaction();
        $st = $pdo->prepare('SELECT estado, usuario_id FROM ordenes WHERE id = ? FOR UPDATE');
        $st->execute([$id]);
        $orden = $st->fetch();
        if (!$orden || !puede_ver_orden($usuario, $id, $orden['usuario_id'] !== null ? (int) $orden['usuario_id'] : null)) {
            $pdo->rollBack();
            error_api('Orden no encontrada.', 404);
        }
        if ($orden['estado'] !== 'fallida') { $pdo->rollBack(); error_api('Esta orden no tiene un pago pendiente.', 409); }

        $st = $pdo->prepare('SELECT producto_id AS productoId, cantidad FROM orden_items WHERE orden_id = ?');
        $st->execute([$id]);
        $lineas = $st->fetchAll();
        foreach ($lineas as $l) {
            if ($l['productoId'] === null) throw new RuntimeException('Un producto de la compra ya no existe.');
        }
        $aprobado = (cuerpo_json()['pago'] ?? 'aprobado') !== 'rechazado';
        if ($aprobado) {
            descontar_stock($pdo, $lineas);
            $pdo->prepare("UPDATE ordenes SET estado = 'pagada' WHERE id = ?")->execute([$id]);
        }
        $pdo->commit();
        responder(orden_completa($pdo, $id));
    }

    error_api('Método no permitido.', 405);
} catch (PDOException $e) {
    // Va primero: PDOException hereda de RuntimeException y no debe exponer su mensaje interno.
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_api('Error de base de datos.', 500);
} catch (RuntimeException $e) {
    // Errores de negocio lanzados por nosotros (stock insuficiente, producto inexistente...).
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_api($e->getMessage(), 409);
}
