-- BASE DE DATOS ARANDUKA
-- Importar este archivo en phpMyAdmin

CREATE DATABASE IF NOT EXISTS aranduka_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aranduka_db;

-- 1. TABLA DE USUARIOS
-- Guardamos todos los datos solicitados. La Cédula (ci) será única para el Login.
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ci VARCHAR(20) NOT NULL UNIQUE, -- Login principal
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    colegio VARCHAR(150),
    rol ENUM('usuario', 'admin') DEFAULT 'usuario',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE APORTES (ENSAYOS / COMUNIDAD)
-- Aquí se guardarán los ensayos que suban en la página y su estado (pendiente/aprobado)
CREATE TABLE IF NOT EXISTS aportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT, -- Quién lo subió
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50), -- Nivel o Materia
    archivo_url VARCHAR(255), -- Ruta del archivo PDF/Doc
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 3. TABLA DE ESTADÍSTICAS DE LIBROS
-- Para saber cuál es el libro más demandado.
-- Usaremos el ID del libro que ya tienes en main.js (ej: 1, 2, 3...)
CREATE TABLE IF NOT EXISTS estadisticas_libros (
    book_id INT PRIMARY KEY, -- ID coincidente con tu JS
    titulo_libro VARCHAR(150),
    total_descargas INT DEFAULT 0,
    ultima_descarga DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar un usuario Administrador por defecto
-- Usuario: admin (o tu CI)
-- Pass: admin123 (Esto se debería hashear en producción, pero para empezar plano o MD5 simple en local)
INSERT INTO usuarios (ci, password, nombre_completo, email, rol) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Aranduka', 'arandukacentral@gmail.com', 'admin');
-- Nota: La contraseña del admin es 'password' (hash de ejemplo) o puedes crear uno nuevo en el registro.

-- 4. TABLA DE HISTORIAL DE DESCARGAS
-- Registro detallado de cada descarga por usuario
CREATE TABLE IF NOT EXISTS historial_descargas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    libro_titulo VARCHAR(255) NOT NULL,
    libro_id VARCHAR(50) DEFAULT NULL,
    fecha_descarga DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
