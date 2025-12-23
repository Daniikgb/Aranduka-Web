<?php
// backend/subir_aporte.php
header('Content-Type: application/json');
require 'conexion.php';

// Verificar que se haya enviado un archivo y datos
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

$titulo = $_POST['titulo'] ?? 'Sin título';
$descripcion = $_POST['descripcion'] ?? '';
$categoria = $_POST['categoria'] ?? 'General';
$usuario_id = $_POST['usuario_id'] ?? null; // ID del usuario que sube (enviado desde frontend o sesión)

// Validar archivo
if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Error al subir el archivo.']);
    exit;
}

$archivo = $_FILES['archivo'];
$ext = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
$allowed = ['pdf', 'doc', 'docx', 'txt'];

if (!in_array($ext, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Formato no permitido. Solo PDF, DOC, DOCX.']);
    exit;
}

// Generar nombre único y mover
$nuevo_nombre = uniqid('aporte_') . '.' . $ext;
$ruta_destino = 'uploads/' . $nuevo_nombre;

if (move_uploaded_file($archivo['tmp_name'], $ruta_destino)) {
    // Guardar en BD
    try {
        $stmt = $pdo->prepare("INSERT INTO aportes (usuario_id, titulo, descripcion, categoria, archivo_url, estado) VALUES (?, ?, ?, ?, ?, 'pendiente')");
        $stmt->execute([$usuario_id, $titulo, $descripcion, $categoria, $ruta_destino]);
        
        echo json_encode(['success' => true, 'message' => 'Aporte subido correctamente. Pendiente de aprobación.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error al guardar en BD: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Error al mover el archivo al servidor.']);
}
?>
