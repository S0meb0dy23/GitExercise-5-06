<?php
$pdo = new PDO("mysql:host=localhost;dbname=server_db", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $pdo->query("SELECT * FROM posts ORDER BY date DESC");
$posts = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $postId = $row['id'];

    // Fetch comments for this post
    $commentStmt = $pdo->prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY id ASC");
    $commentStmt->execute([$postId]);
    $comments = $commentStmt->fetchAll(PDO::FETCH_ASSOC);

    $posts[] = [
        'id' => $row['id'],
        'author' => $row['author'],
        'caption' => $row['caption'],
        'images' => json_decode($row['images'], true) ?? [],
        'likes' => (int)$row['likes'],
        'liked' => false,
        'date' => $row['date'],
        'comments' => $comments
    ];
}

echo json_encode(['success' => true, 'posts' => $posts]);
?>
