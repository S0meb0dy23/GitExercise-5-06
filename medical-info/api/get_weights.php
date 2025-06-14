<?php
session_start();
$conn = new mysqli("localhost", "root", "", "server_db");
$pet_id = intval($_GET['pet_id'] ?? 0);
$data = [];

if ($pet_id > 0 && isset($_SESSION['username'])) {
    // Verify ownership
    $stmt = $conn->prepare("SELECT 1 FROM pets WHERE id = ? AND username = ?");
    $stmt->bind_param("is", $pet_id, $_SESSION['username']);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows > 0) {
        $stmt = $conn->prepare("SELECT record_date, weight FROM weight_records WHERE pet_id = ? ORDER BY record_date");
        $stmt->bind_param("i", $pet_id);
        $stmt->execute();
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $data[] = ['date' => $row['record_date'], 'weight' => floatval($row['weight'])];
        }
    }
}

echo json_encode($data);
?>