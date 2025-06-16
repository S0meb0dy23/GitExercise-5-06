<?php
session_start();
header('Content-Type: application/json');
error_reporting(0); // optional for dev

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once 'db.php'; // must define $pdo

$username = $_SESSION['username'];
$pet_id = intval($_GET['pet_id'] ?? 0);
$data = ['vaccination' => [], 'medication' => [], 'condition' => []];

try {
    if ($pet_id > 0) {
        // Check if pet belongs to current user
        $check = $pdo->prepare("SELECT 1 FROM pets WHERE id = ? AND username = ?");
        $check->execute([$pet_id, $username]);

        if ($check->rowCount() > 0) {
            // Get medical records
            $stmt = $pdo->prepare("SELECT type, description, info FROM medical_records WHERE pet_id = ?");
            $stmt->execute([$pet_id]);

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $type = $row['type'];
                $data[$type][] = [
                    'desc' => $row['description'],
                    'info' => $row['info']
                ];
            }
        }
    }

    echo json_encode($data);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
