<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

require_once 'db.php';

$username = $_SESSION['username'];

try {
    $stmt = $pdo->prepare("SELECT id, name FROM pets WHERE username = ? ORDER BY name");
    $stmt->execute([$username]);
    $pets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($pets);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>