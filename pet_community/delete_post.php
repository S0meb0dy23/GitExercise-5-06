<?php
session_start();
require 'db.php';

$post_id = $_POST['post_id'];
$conn->query("DELETE FROM comments WHERE post_id = $post_id");
$conn->query("DELETE FROM likes WHERE post_id = $post_id");
$conn->query("DELETE FROM images WHERE post_id = $post_id");
$conn->query("DELETE FROM posts WHERE id = $post_id");

echo json_encode(["success" => true]);
