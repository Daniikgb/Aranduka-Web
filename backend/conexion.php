<?php
// backend/conexion.php

$host = 'localhost';
$db   = 'aranduka_db';
$user = 'root'; // Usuario por defecto de XAMPP
$pass = '';     // Contraseña por defecto de XAMPP (vacía)
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    // Conexión Exitosa
} catch (\PDOException $e) {
    // Si falla la conexión, mostrar error (solo en desarrollo)
    // En producción no mostrar detalles del error al usuario
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la Base de Datos: ' . $e->getMessage()]);
    exit;
}
?>
