<?php
session_start();
header('Content-Type: application/json');
error_reporting(0); // optional

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once 'db.php'; // must define $pdo

$username = $_SESSION['username'];

// Input
$pet_id = intval($_POST['pet_id']);
$type = trim($_POST['type']);
$desc = trim($_POST['description']);
$info = trim($_POST['info']);

try {
    // Verify pet ownership
    $stmt = $pdo->prepare("SELECT 1 FROM pets WHERE id = ? AND username = ?");
    $stmt->execute([$pet_id, $username]);

    if ($stmt->rowCount() > 0) {
        // Insert medical record
        $stmt = $pdo->prepare("INSERT INTO medical_records (pet_id, type, description, info, username) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$pet_id, $type, $desc, $info, $username]);
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'unauthorized']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
