<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
  $username = "Guest" . rand(1000, 9999);
  $stmt = $conn->prepare("INSERT INTO user_profile (username) VALUES (?)");
  $stmt->bind_param("s", $username);
  $stmt->execute();
  $_SESSION['user_id'] = $stmt->insert_id;
}

$user_id = $_SESSION['user_id'];
$result = $conn->query("SELECT username FROM user_profile WHERE id = $user_id");
$user = $result->fetch_assoc();

echo json_encode(["username" => $user['username']]);
