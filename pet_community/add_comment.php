<?php
$pdo = new PDO("mysql:host=localhost;dbname=server_db", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$postId = $_POST['post_id'] ?? '';
$text = $_POST['text'] ?? '';

if (!$postId || !$text) {
    echo json_encode(['success' => false, 'error' => 'Missing post ID or comment text']);
    exit;
}

// Get current username
$stmt = $pdo->query("SELECT username FROM user_profile LIMIT 1");
$user = $stmt->fetch(PDO::FETCH_ASSOC);
$username = $user ? $user['username'] : 'User';

$stmt = $pdo->prepare("INSERT INTO comments (post_id, author, text) VALUES (?, ?, ?)");
$stmt->execute([$postId, $username, $text]);

echo json_encode(['success' => true]);
?>
