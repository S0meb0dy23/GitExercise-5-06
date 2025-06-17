<?php
$pdo = new PDO("mysql:host=localhost;dbname=server_db", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$postId = $_POST['post_id'] ?? '';
if (!$postId) {
    echo json_encode(['success' => false, 'error' => 'Post ID required']);
    exit;
}

// Fetch current likes
$stmt = $pdo->prepare("SELECT likes FROM posts WHERE id = ?");
$stmt->execute([$postId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(['success' => false, 'error' => 'Post not found']);
    exit;
}

$currentLikes = (int)$row['likes'];
$toggle = $_POST['liked'] === 'true' ? -1 : 1;

$newLikes = max(0, $currentLikes + $toggle);

$stmt = $pdo->prepare("UPDATE posts SET likes = ? WHERE id = ?");
$stmt->execute([$newLikes, $postId]);

echo json_encode(['success' => true, 'likes' => $newLikes]);
?>
