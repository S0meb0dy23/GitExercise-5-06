<?php
session_start();
header('Content-Type: application/json');
error_reporting(0); // Optional: hide warnings

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once 'db.php'; // This should define $pdo

$username = $_SESSION['username'];
$pet_id = intval($_POST['pet_id']);
$date = trim($_POST['date']);
$weight = floatval($_POST['weight']);

try {
    // Check if the pet belongs to the user
    $stmt = $pdo->prepare("SELECT 1 FROM pets WHERE id = ? AND username = ?");
    $stmt->execute([$pet_id, $username]);

    if ($stmt->rowCount() > 0) {
        // Optional: Check if weight record already exists for this date
        $check = $pdo->prepare("SELECT 1 FROM weight_records WHERE pet_id = ? AND record_date = ?");
        $check->execute([$pet_id, $date]);

        if ($check->rowCount() > 0) {
            echo json_encode(['error' => 'Weight record already exists for this date']);
        } else {
            // Insert weight record
            $insert = $pdo->prepare("INSERT INTO weight_records (pet_id, record_date, weight) VALUES (?, ?, ?)");
            $insert->execute([$pet_id, $date, $weight]);

            echo json_encode(['status' => 'success']);
        }
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
