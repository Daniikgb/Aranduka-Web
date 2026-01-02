<?php
// backend/eliminar_libro.php
header('Content-Type: application/json');
require 'conexion.php';

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID no proporcionado']);
    exit;
}

try {
    // Check protection
    $check = $pdo->prepare("SELECT es_sistema FROM libros WHERE id = ?");
    $check->execute([$id]);
    $book = $check->fetch();

    if ($book && $book['es_sistema'] == 1) {
        echo json_encode(['success' => false, 'message' => 'Error Crítico: Este libro es parte del sistema base y está protegido. No se puede eliminar.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM libros WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true, 'message' => 'Libro eliminado del catálogo.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
