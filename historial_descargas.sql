CREATE TABLE IF NOT EXISTS historial_descargas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    libro_titulo VARCHAR(255) NOT NULL,
    libro_id VARCHAR(50) DEFAULT NULL,
    fecha_descarga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
