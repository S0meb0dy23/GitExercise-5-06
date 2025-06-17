<?php
$pdo = new PDO("mysql:host=localhost;dbname=server_db", "root", "");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get the first username from user_profile table
$stmt = $pdo->query("SELECT username FROM user_profile LIMIT 1");
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode(['username' => $user ? $user['username'] : 'User']);
?>
