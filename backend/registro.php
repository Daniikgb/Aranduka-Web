<?php
// backend/registro.php
header('Content-Type: application/json');
require 'conexion.php';

// Recibir datos JSON o POST normal
$input = json_decode(file_get_contents('php://input'), true);

// Si no es JSON, intentamos leer $_POST (para formularios std)
if (!$input) {
    $input = $_POST;
}

$ci = $input['ci'] ?? '';
$nombre = $input['nombre'] ?? '';
$telefono = $input['telefono'] ?? '';
$email = $input['email'] ?? '';
$colegio = $input['colegio'] ?? '';
$password = $input['password'] ?? '';

// 1. Validaciones básicas
if (empty($ci) || empty($nombre) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios (CI, Nombre o Contraseña).']);
    exit;
}

// 2. Comprobar si la CI ya existe
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE ci = ?");
$stmt->execute([$ci]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Ya existe un usuario registrado con esta Cédula (CI).']);
    exit;
}

// 3. Encriptar contraseña (IMPORTANTE para seguridad)
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// 4. Insertar en la Base de Datos
try {
    $sql = "INSERT INTO usuarios (ci, nombre_completo, telefono, email, colegio, password, rol) VALUES (?, ?, ?, ?, ?, ?, 'usuario')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ci, $nombre, $telefono, $email, $colegio, $hashed_password]);
    
    $newUserId = $pdo->lastInsertId();
    
    // Preparar datos de sesión para retorno inmediato (Auto-Login)
    $userData = [
        'id' => $newUserId,
        'ci' => $ci,
        'nombre_completo' => $nombre,
        'email' => $email,
        'rol' => 'usuario', // Rol por defecto
        'colegio' => $colegio,
        'telefono' => $telefono
    ];

    echo json_encode([
        'success' => true, 
        'message' => '¡Registro completado! Iniciando sesión...',
        'user' => $userData
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error al registrar en BD: ' . $e->getMessage()]);
}
?>
