<?php
session_start();
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$post_id = intval($_POST['post_id']);
if (!isset($_SESSION['liked_posts'])) $_SESSION['liked_posts'] = [];

$liked = in_array($post_id, $_SESSION['liked_posts']);

if ($liked) {
    $stmt = $conn->prepare("UPDATE posts SET likes = likes - 1 WHERE id = ? AND likes > 0");
    $stmt->bind_param("i", $post_id);
    $stmt->execute();
    $_SESSION['liked_posts'] = array_diff($_SESSION['liked_posts'], [$post_id]);
} else {
    $stmt = $conn->prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?");
    $stmt->bind_param("i", $post_id);
    $stmt->execute();
    $_SESSION['liked_posts'][] = $post_id;
}
$stmt->close();

$res = $conn->query("SELECT likes FROM posts WHERE id = $post_id");
$row = $res->fetch_assoc();
echo json_encode(["liked" => !$liked, "likes" => $row['likes']]);
?>
