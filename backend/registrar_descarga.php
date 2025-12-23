<?php
// backend/registrar_descarga.php
header('Content-Type: application/json');
require 'conexion.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true);

// Datos esperados
$usuario_id = $input['usuario_id'] ?? null;
$libro_titulo = $input['libro_titulo'] ?? 'Desconocido';
$libro_id = $input['libro_id'] ?? null;

// Si no hay usuario logueado en el frontend, intentamos ver la sesión PHP, 
// o permitimos guardar como anónimo (id=0 o null) si la lógica de negocio lo permite.
// El usuario pidió ver qué descarga CADA cliente, así que asumimos que debe estar logueado.

if (!$usuario_id) {
    if (isset($_SESSION['user_id'])) {
        $usuario_id = $_SESSION['user_id'];
    } else {
        // Opción: No registrar si no hay usuario, o registrar como 0
        echo json_encode(['success' => false, 'message' => 'Usuario no identificado']);
        exit;
    }
}

try {
    $stmt = $pdo->prepare("INSERT INTO historial_descargas (usuario_id, libro_titulo, libro_id) VALUES (?, ?, ?)");
    $stmt->execute([$usuario_id, $libro_titulo, $libro_id]);
    
    // También actualizar contador global si existe la tabla
    $stmtUpdate = $pdo->prepare("UPDATE estadisticas_libros SET total_descargas = total_descargas + 1, ultima_descarga = NOW() WHERE titulo_libro = ?");
    $stmtUpdate->execute([$libro_titulo]);
    
    // Si no afectó filas (libro nuevo en stats), insertar
    if ($stmtUpdate->rowCount() == 0) {
        $stmtInsertStat = $pdo->prepare("INSERT INTO estadisticas_libros (titulo_libro, total_descargas) VALUES (?, 1)");
        $stmtInsertStat->execute([$libro_titulo]);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
