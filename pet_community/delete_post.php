<?php
$pdo = new PDO("mysql:host=localhost;dbname=server_db", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$postId = $_POST['post_id'] ?? '';
if (!$postId) {
    echo json_encode(['success' => false, 'error' => 'Post ID required']);
    exit;
}

// Delete related comments first
$pdo->prepare("DELETE FROM comments WHERE post_id = ?")->execute([$postId]);

// Delete the post
$pdo->prepare("DELETE FROM posts WHERE id = ?")->execute([$postId]);

echo json_encode(['success' => true]);
?>
