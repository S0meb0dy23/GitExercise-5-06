<?php
session_start();
header('Content-Type: application/json');
error_reporting(0); // optional: hide warnings

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once 'db.php'; // defines $pdo

$username = $_SESSION['username'];
$pet_id = intval($_GET['pet_id'] ?? 0);
$data = [];

try {
    if ($pet_id > 0) {
        // Check pet ownership
        $check = $pdo->prepare("SELECT 1 FROM pets WHERE id = ? AND username = ?");
        $check->execute([$pet_id, $username]);

        if ($check->rowCount() > 0) {
            // Fetch weight records
            $stmt = $pdo->prepare("SELECT record_date, weight FROM weight_records WHERE pet_id = ? ORDER BY record_date");
            $stmt->execute([$pet_id]);

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $data[] = [
                    'date' => $row['record_date'],
                    'weight' => floatval($row['weight'])
                ];
            }
        }
    }

    echo json_encode($data);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
