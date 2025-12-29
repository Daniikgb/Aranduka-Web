<?php
// backend/update_schema.php
require 'conexion.php';

try {
    // 1. Create table `libros`
    $sql = "CREATE TABLE IF NOT EXISTS libros (
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
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;";
    
    $pdo->exec($sql);
    // Silent mode for API: Table "libros" verified/created

    // 2. Seed initial data (Only if empty)
    $stmt = $pdo->query("SELECT COUNT(*) FROM libros");
    if ($stmt->fetchColumn() == 0) {
        $initialBooks = [
            ['Texto "Mis Huellas" Pre-Jardín', 'inicial', 'pre-jardin', 'img/portadas/pre-jardin.png', 'documentos/libro-ejemplo.pdf', 'Diseñado con cariño...'],
            ['Texto "Mis Huellas" Jardín', 'inicial', 'jardin', 'img/portadas/jardin.png', 'documentos/libro-ejemplo.pdf', 'Fomenta la expresión...'],
            ['Matemática 1° Grado', 'matematica', '1-grado', 'img/portadas/mat1.png', 'documentos/libro-ejemplo.pdf', 'Introducción a números...'],
            ['Guaraní 1° Grado', 'guarani', '1-grado', 'img/portadas/gua1.png', 'documentos/libro-ejemplo.pdf', 'Ñe’ê ñepyrû...']
        ];

        $insert = $pdo->prepare("INSERT INTO libros (titulo, categoria, nivel, imagen_url, archivo_url, descripcion) VALUES (?, ?, ?, ?, ?, ?)");
        
        foreach ($initialBooks as $book) {
            $insert->execute($book);
        }
    }

} catch (PDOException $e) {
    // If it fails, we might want to log it, but for now just die or silent fail? 
    // die() breaks JSON too. Let's just log and continue, letting the actual query fail if needs be.
    error_log("Error al actualizar esquema: " . $e->getMessage());
}
?>
