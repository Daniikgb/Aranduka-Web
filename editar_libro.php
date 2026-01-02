<?php
// backend/editar_libro.php
header('Content-Type: application/json');
require 'conexion.php';

// Check POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$id = $_POST['id'] ?? null;
$titulo = $_POST['title'] ?? '';
$autor = $_POST['author'] ?? '';
$categoria = $_POST['category'] ?? '';
$nivel = $_POST['level'] ?? '';
$descripcion = $_POST['description'] ?? '';

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID de libro faltante']);
    exit;
}

try {
    // Check protection
    $check = $pdo->prepare("SELECT es_sistema FROM libros WHERE id = ?");
    $check->execute([$id]);
    $book = $check->fetch();

    if ($book && $book['es_sistema'] == 1) {
        echo json_encode(['success' => false, 'message' => 'Acción Denegada: Este libro está protegido por el sistema.']);
        exit;
    }

    // Basic update (not handling file replacement for simplicity yet)
    $sql = "UPDATE libros SET titulo = ?, autor = ?, categoria = ?, nivel = ?, descripcion = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$titulo, $autor, $categoria, $nivel, $descripcion, $id]);

    echo json_encode(['success' => true, 'message' => 'Libro actualizado correctamente.']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
}
?>
