<?php
// backend/admin_dashboard.php
header('Content-Type: application/json');
require 'conexion.php';
session_start();

try {
    // 1. Estadísticas Generales
    $stmtUsers = $pdo->query("SELECT COUNT(*) as total FROM usuarios");
    $totalUsers = $stmtUsers->fetchColumn();

    $stmtPendientes = $pdo->query("SELECT COUNT(*) as total FROM aportes WHERE estado = 'pendiente'");
    $totalPendientes = $stmtPendientes->fetchColumn();

    // 2. Lista de Usuarios (Con TODOS los datos)
    // Se solicitó ver "TODOS los datos del cliente"
    $stmtListaUsers = $pdo->query("SELECT * FROM usuarios ORDER BY fecha_registro DESC");
    $users = $stmtListaUsers->fetchAll(PDO::FETCH_ASSOC);

    // Iterar usuarios para agregar su historial de descargas personal reciente (opcional, o traerlo aparte)
    // Para no sobrecargar, haremos una query separada de descargas globales, o un JOIN si se pide explícitamente por usuario.
    // El usuario dijo "ver que archivos descargo". Esto implica ver el historial por usuario.
    // Vamos a adjuntar a cada usuario sus últimas 5 descargas.
    
    foreach ($users as &$user) {
        $stmtHistory = $pdo->prepare("SELECT libro_titulo, fecha_descarga FROM historial_descargas WHERE usuario_id = ? ORDER BY fecha_descarga DESC LIMIT 5");
        $stmtHistory->execute([$user['id']]);
        $user['historial_descargas'] = $stmtHistory->fetchAll(PDO::FETCH_ASSOC);

        // Fetch Uploads/Aportes
        $stmtContrib = $pdo->prepare("SELECT titulo, estado, fecha_subida FROM aportes WHERE usuario_id = ? ORDER BY fecha_subida DESC");
        $stmtContrib->execute([$user['id']]);
        $user['historial_aportes'] = $stmtContrib->fetchAll(PDO::FETCH_ASSOC);

        unset($user['password']); // Quitar hash por seguridad
    }

    // 3. Lista de Aportes (Comunidad)
    $stmtAportes = $pdo->query("SELECT a.*, u.nombre_completo as autor_nombre FROM aportes a LEFT JOIN usuarios u ON a.usuario_id = u.id ORDER BY a.fecha_subida DESC");
    $aportes = $stmtAportes->fetchAll(PDO::FETCH_ASSOC);

    // 4. Historial Global de Descargas (Últimas 50) - Para el monitor general
    $stmtDownloads = $pdo->query("SELECT h.*, u.nombre_completo FROM historial_descargas h LEFT JOIN usuarios u ON h.usuario_id = u.id ORDER BY h.fecha_descarga DESC LIMIT 50");
    $globalDownloads = $stmtDownloads->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'stats' => [
            'users' => $totalUsers,
            'pending' => $totalPendientes
        ],
        'users_list' => $users,
        'aportes_list' => $aportes,
        'recent_downloads' => $globalDownloads
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al obtener datos: ' . $e->getMessage()]);
}
?>
