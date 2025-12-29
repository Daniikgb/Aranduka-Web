<?php
// backend/cambiar_rol.php
header('Content-Type: application/json');
require 'conexion.php';

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;
$newRole = $input['role'] ?? null; // 'admin' or 'usuario'

if (!$id || !$newRole) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

try {
    // Security: Prevent changing main admin
    $stmt = $pdo->prepare("SELECT ci FROM usuarios WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();

    if ($user && ($user['ci'] === 'admin' || $user['ci'] === 'mathiassgaleano@gmail.com')) {
        echo json_encode(['success' => false, 'message' => 'No se puede modificar al Super Admin.']);
        exit;
    }

    $update = $pdo->prepare("UPDATE usuarios SET rol = ? WHERE id = ?");
    $update->execute([$newRole, $id]);

    echo json_encode(['success' => true, 'message' => "Rol actualizado a '$newRole'."]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
