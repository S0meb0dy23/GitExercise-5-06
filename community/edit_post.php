<?php
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$post_id = intval($_POST['post_id']);
$caption = $_POST['caption'];

$stmt = $conn->prepare("UPDATE posts SET caption = ? WHERE id = ?");
$stmt->bind_param("si", $caption, $post_id);
$stmt->execute();
$stmt->close();

echo json_encode(["success" => true]);
?>
