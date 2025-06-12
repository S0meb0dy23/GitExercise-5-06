<?php
session_start();
require 'db.php';

$user_id = $_SESSION['user_id'];
$post_id = $_POST['post_id'];
$text = $_POST['text'];

$stmt = $conn->prepare("INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)");
$stmt->bind_param("iis", $post_id, $user_id, $text);
$stmt->execute();

echo json_encode(["success" => true]);
