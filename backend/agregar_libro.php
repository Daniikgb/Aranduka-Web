<?php
// backend/agregar_libro.php
header('Content-Type: application/json');
require 'conexion.php';
require_once 'update_schema.php'; 

// --- EMERGENCY FIX: Force Table Creation ---
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS libros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        categoria VARCHAR(50),
        nivel VARCHAR(50),
        imagen_url VARCHAR(255),
        archivo_url VARCHAR(255),
        guia_docente_url VARCHAR(255) DEFAULT NULL,
        autor VARCHAR(100) DEFAULT 'Equipo de Aranduka',
        descripcion TEXT,
        fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
} catch (Exception $e) { /* Silent fail if already exists or permission error */ }
// -------------------------------------------

// Validar que sea POST y tenga archivos
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$titulo = $_POST['title'] ?? '';
$autor = $_POST['author'] ?? 'Equipo Aranduka';
$categoria = $_POST['category'] ?? '';
$nivel = $_POST['level'] ?? '';
$descripcion = $_POST['description'] ?? '';

// Definir directorios de subida (relativos al backend/ o absolutos del proyecto)
// Asumimos que la carpeta 'uploads' existe en backend/ o en root. 
// Vamos a guardar en la carpeta padre 'img/portadas' y 'documentos' para mantener estructura del frontend.
// Ruta proyecto: backend/../ = root
$uploadDirImg = '../img/portadas/';
$uploadDirDoc = '../documentos/';

// Crear carpetas si no existen (intento)
if (!file_exists($uploadDirImg)) mkdir($uploadDirImg, 0777, true);
if (!file_exists($uploadDirDoc)) mkdir($uploadDirDoc, 0777, true);

$coverUrl = 'img/libro_default.png'; // Default
$fileUrl = '';

try {
    // 1. Subir Portada
    if (isset($_FILES['cover']) && $_FILES['cover']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['cover']['name'], PATHINFO_EXTENSION);
        $filename = 'cover_' . time() . '.' . $ext;
        if (move_uploaded_file($_FILES['cover']['tmp_name'], $uploadDirImg . $filename)) {
            $coverUrl = 'img/portadas/' . $filename;
        }
    }

    // 2. Subir PDF
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
        $filename = 'doc_' . time() . '.' . $ext;
        if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadDirDoc . $filename)) {
            $fileUrl = 'documentos/' . $filename;
        }
    } else {
        throw new Exception("El archivo PDF es obligatorio.");
    }

    // 3. Insertar en BD
    $sql = "INSERT INTO libros (titulo, autor, categoria, nivel, descripcion, imagen_url, archivo_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$titulo, $autor, $categoria, $nivel, $descripcion, $coverUrl, $fileUrl]);

    echo json_encode(['success' => true, 'message' => 'Libro agregado correctamente al catálogo.']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
