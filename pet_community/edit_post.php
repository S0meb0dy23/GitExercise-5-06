<?php
session_start();
require 'db.php';

$post_id = $_POST['post_id'];
$caption = $_POST['caption'];

$stmt = $conn->prepare("UPDATE posts SET caption = ? WHERE id = ?");
$stmt->bind_param("si", $caption, $post_id);
$stmt->execute();

echo json_encode(["success" => true]);
