<?php
// backend/eliminar_usuario.php
header('Content-Type: application/json');
require 'conexion.php';

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
    exit;
}

try {
    // Prevent deleting the main admin
    $stmt = $pdo->prepare("SELECT rol, ci FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();

    if ($user && ($user['ci'] === 'admin' || $user['ci'] === 'mathiassgaleano@gmail.com')) {
        echo json_encode(['success' => false, 'message' => 'No puedes eliminar al Super Admin.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true, 'message' => 'Usuario eliminado correctamente.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
