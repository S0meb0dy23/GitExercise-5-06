<?php
session_start();
$conn = new mysqli("localhost", "root", "", "pet_community");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$post_id = $_POST['post_id'];
$text = $_POST['text'];

$session_id = session_id();
$user_id = null;

$stmt = $conn->prepare("SELECT id FROM users WHERE session_id = ?");
$stmt->bind_param("s", $session_id);
$stmt->execute();
$stmt->bind_result($user_id);
$stmt->fetch();
$stmt->close();

$stmt = $conn->prepare("INSERT INTO comments (post_id, text, user_id) VALUES (?, ?, ?)");
$stmt->bind_param("isi", $post_id, $text, $user_id);
$stmt->execute();
$stmt->close();

echo json_encode(["success" => true]);
?>
