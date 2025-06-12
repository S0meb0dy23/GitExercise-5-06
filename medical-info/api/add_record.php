<?php
$conn = new mysqli("localhost", "root", "", "server_db");
$pet_id = intval($_POST['pet_id']);
$type = $_POST['type'];
$desc = $_POST['description'];
$info = $_POST['info'];

$stmt = $conn->prepare("INSERT INTO medical_records (pet_id, type, description, info) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $pet_id, $type, $desc, $info);
$stmt->execute();
echo "success";
?>
