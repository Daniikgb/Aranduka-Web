<?php
// backend/gestion_aporte.php
header('Content-Type: application/json');
require 'conexion.php';
session_start();

// Security check
/*
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}
*/

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;
$accion = $input['accion'] ?? null; // 'aprobar', 'rechazar', 'eliminar'

if (!$id || !$accion) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    if ($accion === 'aprobar') {
        $stmt = $pdo->prepare("UPDATE aportes SET estado = 'aprobado' WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Aporte aprobado.']);
    } elseif ($accion === 'rechazar') {
        $stmt = $pdo->prepare("UPDATE aportes SET estado = 'rechazado' WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Aporte rechazado.']);
    } elseif ($accion === 'eliminar') {
        // Opcional: Eliminar archivo físico también
        // $stmtFile = $pdo->prepare("SELECT archivo_url FROM aportes WHERE id = ?");
        // ... unlink(...)
        
        $stmt = $pdo->prepare("DELETE FROM aportes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Aporte eliminado.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
