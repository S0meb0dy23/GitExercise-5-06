<?php
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$post_id = intval($_POST['post_id']);
$stmt = $conn->prepare("DELETE FROM posts WHERE id = ?");
$stmt->bind_param("i", $post_id);
$stmt->execute();
$stmt->close();

echo json_encode(["success" => true]);
?>
