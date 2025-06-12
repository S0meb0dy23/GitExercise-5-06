<?php
session_start();
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) die("Connection failed");

$session_id = session_id();
$username = "User";

$stmt = $conn->prepare("SELECT username FROM users WHERE session_id = ?");
$stmt->bind_param("s", $session_id);
$stmt->execute();
$stmt->bind_result($username);
$stmt->fetch();
$stmt->close();

echo json_encode(["username" => $username]);
?>
