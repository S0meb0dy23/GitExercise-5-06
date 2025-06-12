<?php
session_start();
require 'db.php';

$caption = $_POST['caption'];
$author_id = $_SESSION['user_id'] ?? 0;

$stmt = $conn->prepare("INSERT INTO posts (author_id, caption) VALUES (?, ?)");
$stmt->bind_param("is", $author_id, $caption);
$stmt->execute();
$post_id = $stmt->insert_id;

$uploaded = true;
$target_dir = "uploads/";
if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);

foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
  $filename = basename($_FILES['images']['name'][$key]);
  $target_file = $target_dir . time() . "_" . $filename;
  if (move_uploaded_file($tmp_name, $target_file)) {
    $stmt = $conn->prepare("INSERT INTO images (post_id, image_path) VALUES (?, ?)");
    $stmt->bind_param("is", $post_id, $target_file);
    $stmt->execute();
  } else {
    $uploaded = false;
  }
}

echo json_encode(["success" => $uploaded]);
