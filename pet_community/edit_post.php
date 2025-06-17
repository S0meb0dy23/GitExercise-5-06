<?php
$pdo = new PDO("mysql:host=localhost;dbname=server_db", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$postId = $_POST['post_id'] ?? '';
$caption = $_POST['caption'] ?? '';

if (!$postId || !$caption) {
    echo json_encode(['success' => false, 'error' => 'Missing post ID or caption']);
    exit;
}

$stmt = $pdo->prepare("UPDATE posts SET caption = ? WHERE id = ?");
$stmt->execute([$caption, $postId]);

echo json_encode(['success' => true]);
?>
