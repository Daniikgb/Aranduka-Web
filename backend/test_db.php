<?php
// backend/test_db.php
require 'conexion.php';

try {
    $stmt = $pdo->query("SELECT 1");
    echo "<h1>✅ CONEXIÓN EXITOSA</h1>";
    echo "<p>La página se ha conectado correctamente a la base de datos <b>aranduka_db</b>.</p>";
    
    // Verificar si la tabla usuarios existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'usuarios'");
    if($stmt->rowCount() > 0) {
        echo "<p>✅ La tabla 'usuarios' existe.</p>";
    } else {
        echo "<p>❌ ERROR: La tabla 'usuarios' NO existe. Importa el archivo database.sql nuevamente.</p>";
    }

} catch (PDOException $e) {
    echo "<h1>❌ ERROR DE CONEXIÓN</h1>";
    echo "<p>Detalle: " . $e->getMessage() . "</p>";
    echo "<p>Verifica que XAMPP (MySQL) esté encendido y que la base de datos se llame 'aranduka_db'.</p>";
}
?>
