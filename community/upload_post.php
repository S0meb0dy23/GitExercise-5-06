<?php
session_start();
$conn = new mysqli("localhost", "root", "", "pet_community");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$session_id = session_id();
$user_id = null;

$stmt = $conn->prepare("SELECT id FROM users WHERE session_id = ?");
$stmt->bind_param("s", $session_id);
$stmt->execute();
$stmt->bind_result($user_id);
$stmt->fetch();
$stmt->close();

$caption = $_POST['caption'];

$stmt = $conn->prepare("INSERT INTO posts (user_id, caption) VALUES (?, ?)");
$stmt->bind_param("is", $user_id, $caption);
$stmt->execute();
$post_id = $stmt->insert_id;
$stmt->close();

foreach ($_FILES['images']['tmp_name'] as $index => $tmpName) {
    if ($_FILES['images']['error'][$index] === 0) {
        $size = $_FILES['images']['size'][$index];
        $mime = $_FILES['images']['type'][$index];

        if ($size <= 10 * 1024 * 1024) {
            $data = file_get_contents($tmpName);
            $imgStmt = $conn->prepare("INSERT INTO images (post_id, image_data, mime_type) VALUES (?, ?, ?)");
            $imgStmt->bind_param("iss", $post_id, $data, $mime);
            $imgStmt->execute();
            $imgStmt->close();
        }
    }
}

echo json_encode(["success" => true]);
?>
