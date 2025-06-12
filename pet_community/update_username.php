<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) exit;

$username = $_POST['username'];
$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("UPDATE user_profile SET username = ? WHERE id = ?");
$stmt->bind_param("si", $username, $user_id);
$stmt->execute();

echo json_encode(["username" => $username]);
