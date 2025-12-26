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
    $errCode = $_FILES['archivo']['error'] ?? 'No file';
    echo json_encode(['success' => false, 'message' => "Error al subir el archivo. Código PHP: $errCode"]);
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
// Fix: Use absolute path to ensure correct resolution
$upload_dir = __DIR__ . '/uploads/';

// Crear carpeta si no existe
if (!is_dir($upload_dir)) {
    if (!mkdir($upload_dir, 0777, true)) {
         echo json_encode(['success' => false, 'message' => 'Error interno: No se pudo crear carpeta uploads.']);
         exit;
    }
}

$ruta_destino = $upload_dir . $nuevo_nombre;
$ruta_web = 'backend/uploads/' . $nuevo_nombre; // Ruta para guardar en la BD

if (move_uploaded_file($archivo['tmp_name'], $ruta_destino)) {
    // Guardar en BD (guardamos la ruta relativa para la web)
    try {
        $stmt = $pdo->prepare("INSERT INTO aportes (usuario_id, titulo, descripcion, categoria, archivo_url, estado) VALUES (?, ?, ?, ?, ?, 'pendiente')");
        $stmt->execute([$usuario_id, $titulo, $descripcion, $categoria, $ruta_web]);
        
        echo json_encode(['success' => true, 'message' => 'Aporte subido correctamente. Pendiente de aprobación.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error al guardar en BD: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Error al mover el archivo al servidor.']);
}
?>
