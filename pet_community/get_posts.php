<?php
session_start();
require 'db.php';

$user_id = $_SESSION['user_id'] ?? 0;

$sql = "SELECT p.*, u.username AS author
        FROM posts p
        JOIN user_profile u ON p.author_id = u.id
        ORDER BY p.created_at DESC";
$result = $conn->query($sql);

$posts = [];

while ($row = $result->fetch_assoc()) {
  $post_id = $row['id'];

  $img_result = $conn->query("SELECT image_path FROM images WHERE post_id = $post_id");
  $images = [];
  while ($img = $img_result->fetch_assoc()) {
    $images[] = $img['image_path'];
  }

  $like_result = $conn->query("SELECT COUNT(*) AS count FROM likes WHERE post_id = $post_id");
  $like_count = $like_result->fetch_assoc()['count'];

  $liked_result = $conn->query("SELECT 1 FROM likes WHERE post_id = $post_id AND user_id = $user_id");
  $liked = $liked_result->num_rows > 0;

  $comment_result = $conn->query("SELECT c.text, u.username AS author
                                  FROM comments c
                                  JOIN user_profile u ON c.user_id = u.id
                                  WHERE post_id = $post_id
                                  ORDER BY c.created_at ASC");
  $comments = [];
  while ($c = $comment_result->fetch_assoc()) {
    $comments[] = $c;
  }

  $posts[] = [
    "id" => $post_id,
    "author" => $row['author'],
    "caption" => $row['caption'],
    "date" => $row['created_at'],
    "images" => $images,
    "likes" => $like_count,
    "liked" => $liked,
    "comments" => $comments
  ];
}

echo json_encode($posts);
