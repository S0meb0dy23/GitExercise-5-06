<?php
session_start();
header('Content-Type: application/json');

// Show errors during development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check for user login
if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

// Validate required POST fields
if (!isset($_POST['pet_id'], $_POST['date'], $_POST['weight'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Sanitize and validate input values
$username = $_SESSION['username'];
$pet_id = filter_var($_POST['pet_id'], FILTER_VALIDATE_INT);
$date = trim($_POST['date']);
$weight = filter_var($_POST['weight'], FILTER_VALIDATE_FLOAT);

if (!$pet_id || !$date || $weight === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

require_once 'db.php'; // Make sure this defines $pdo

try {
    // Ensure pet belongs to the current user
    $stmt = $pdo->prepare("SELECT 1 FROM pets WHERE id = ? AND username = ?");
    $stmt->execute([$pet_id, $username]);

    if ($stmt->fetch()) {
        // Use ON DUPLICATE KEY UPDATE to handle duplicates silently
        $insert = $pdo->prepare("
            INSERT INTO weight_records (pet_id, record_date, weight) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE weight = VALUES(weight)
        ");
        $insert->execute([$pet_id, $date, $weight]);

        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'You are not authorized to add records for this pet']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}