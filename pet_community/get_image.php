<?php
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$id = $_GET['id'];
$stmt = $conn->prepare("SELECT image_data, mime_type FROM images WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($data, $mime);

if ($stmt->num_rows > 0) {
    $stmt->fetch();
    header("Content-Type: $mime");
    echo $data;
} else {
    http_response_code(404);
}
$stmt->close();
?>
