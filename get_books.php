<?php
require_once 'update_schema.php';

// --- ROBUSTNESS: Ensure Table Exists for Main Page too ---
try {
    $pdo->query("SELECT 1 FROM libros LIMIT 1");
} catch (Exception $e) {
    // If query fails, try to create table
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
    } catch (Exception $ex) { /* silent */ }
}
// ---------------------------------------------------------

try {
    $stmt = $pdo->query("SELECT * FROM libros ORDER BY id ASC");
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Map database columns to frontend expected properties if needed (though we matched names fairly well)
    // Frontend expects: title, category, level, image, file, guideFile, author, description
    $mappedBooks = array_map(function($book) {
        return [
            'id' => $book['id'],
            'title' => $book['titulo'],
            'category' => $book['categoria'],
            'level' => $book['nivel'],
            'image' => $book['imagen_url'],
            'file' => $book['archivo_url'],
            'guideFile' => $book['guia_docente_url'], // Might be null
            'author' => $book['autor'],
            'description' => $book['descripcion'],
            'es_sistema' => isset($book['es_sistema']) ? $book['es_sistema'] : 0
        ];
    }, $books);

    echo json_encode(['success' => true, 'data' => $mappedBooks]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
