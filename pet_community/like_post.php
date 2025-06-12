<?php
session_start();
require 'db.php';

$user_id = $_SESSION['user_id'];
$post_id = $_POST['post_id'];

$check = $conn->query("SELECT * FROM likes WHERE post_id = $post_id AND user_id = $user_id");
if ($check->num_rows > 0) {
  $conn->query("DELETE FROM likes WHERE post_id = $post_id AND user_id = $user_id");
  $liked = false;
} else {
  $conn->query("INSERT INTO likes (post_id, user_id) VALUES ($post_id, $user_id)");
  $liked = true;
}

$likes = $conn->query("SELECT COUNT(*) AS count FROM likes WHERE post_id = $post_id")->fetch_assoc()['count'];
echo json_encode(["liked" => $liked, "likes" => $likes]);
