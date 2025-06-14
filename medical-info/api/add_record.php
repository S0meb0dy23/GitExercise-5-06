<?php
session_start();
if (!isset($_SESSION['username'])) {
    die("unauthorized");
}

$conn = new mysqli("localhost", "root", "", "server_db");
$pet_id = intval($_POST['pet_id']);
$type = $_POST['type'];
$desc = $_POST['description'];
$info = $_POST['info'];

// Verify ownership
$stmt = $conn->prepare("SELECT 1 FROM pets WHERE id = ? AND username = ?");
$stmt->bind_param("is", $pet_id, $_SESSION['username']);
$stmt->execute();

if ($stmt->get_result()->num_rows > 0) {
    $stmt = $conn->prepare("INSERT INTO medical_records (pet_id, type, description, info) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $pet_id, $type, $desc, $info);
    $stmt->execute();
    echo "success";
} else {
    echo "unauthorized";
}
?>