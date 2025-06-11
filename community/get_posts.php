<?php
session_start();
$conn = new mysqli("localhost", "root", "", "pet_community");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$session_id = session_id();
$user_id = null;
$username = "User";

$userQuery = $conn->prepare("SELECT id, username FROM users WHERE session_id = ?");
$userQuery->bind_param("s", $session_id);
$userQuery->execute();
$userQuery->bind_result($user_id, $username);
$userQuery->fetch();
$userQuery->close();

$liked_posts = $_SESSION['liked_posts'] ?? [];
$postsResult = $conn->query("
  SELECT p.*, u.username AS author 
  FROM posts p 
  LEFT JOIN users u ON p.user_id = u.id 
  ORDER BY p.created_at DESC
");

$posts = [];
while ($row = $postsResult->fetch_assoc()) {
    $post_id = $row['id'];

    $imgQuery = $conn->prepare("SELECT id FROM images WHERE post_id = ?");
    $imgQuery->bind_param("i", $post_id);
    $imgQuery->execute();
    $imgResult = $imgQuery->get_result();

    $images = [];
    while ($imgRow = $imgResult->fetch_assoc()) {
        $images[] = "get_image.php?id=" . $imgRow['id'];
    }

    $comments = [];
    $comQuery = $conn->prepare("
        SELECT c.text, u.username AS author 
        FROM comments c 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = ? ORDER BY c.created_at
    ");
    $comQuery->bind_param("i", $post_id);
    $comQuery->execute();
    $comResult = $comQuery->get_result();
    while ($com = $comResult->fetch_assoc()) {
        $comments[] = $com;
    }

    $posts[] = [
        "id" => $post_id,
        "author" => $row['author'] ?? "User",
        "caption" => $row['caption'],
        "date" => $row['created_at'],
        "images" => $images,
        "likes" => $row['likes'],
        "liked" => in_array($post_id, $liked_posts),
        "comments" => $comments
    ];
}

echo json_encode($posts);
?>
