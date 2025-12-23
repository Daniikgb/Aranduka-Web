<?php
// backend/obtener_aportes_aprobados.php
header('Content-Type: application/json');
require 'conexion.php';

try {
    // Queries all approved contributions
    // We join with usuarios to get the potentially updated author name, although 'autor_nombre' in aportes might be used.
    // Let's rely on 'autor_nombre' from aportes table as it might differ from registration name or be a pseudonym
    $stmt = $pdo->query("SELECT a.id, a.titulo, a.descripcion, a.categoria, a.archivo_url, a.fecha_subida, a.autor_nombre 
                         FROM aportes a 
                         WHERE a.estado = 'aprobado' 
                         ORDER BY a.fecha_subida DESC");
    
    $aportes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $aportes]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al cargar aportes: ' . $e->getMessage()]);
}
?>
