<?php
session_start();
if (!isset($_SESSION['username'])) {
    die("error");
}

$conn = new mysqli("localhost", "root", "", "server_db");
$pet_id = intval($_POST['pet_id']);
$date = $_POST['date'];
$weight = floatval($_POST['weight']);

// Verify ownership
$stmt = $conn->prepare("SELECT 1 FROM pets WHERE id = ? AND username = ?");
$stmt->bind_param("is", $pet_id, $_SESSION['username']);
$stmt->execute();

if ($stmt->get_result()->num_rows > 0) {
    $stmt = $conn->prepare("INSERT INTO weight_records (pet_id, record_date, weight) VALUES (?, ?, ?)");
    $stmt->bind_param("isd", $pet_id, $date, $weight);
    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "error";
    }
} else {
    echo "unauthorized";
}
?>