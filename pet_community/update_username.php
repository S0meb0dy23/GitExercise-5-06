<?php
session_start();
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$session_id = session_id();
$username = trim($_POST['username']);

if ($username === "") $username = "User";

$stmt = $conn->prepare("INSERT INTO users (session_id, username) VALUES (?, ?)
                        ON DUPLICATE KEY UPDATE username = VALUES(username)");
$stmt->bind_param("ss", $session_id, $username);
$stmt->execute();
$stmt->close();

echo json_encode(["success" => true, "username" => $username]);
?>
