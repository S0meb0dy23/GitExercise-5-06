<?php
session_start();
include 'db.php';

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    die("Unauthorized");
}

$id = $_POST['id'];
$title = $_POST['title'];
$type = $_POST['type'];
$time_from = $_POST['time_from'];
$time_to = $_POST['time_to'];
$username = $_SESSION['username'];

$stmt = $mysqli->prepare("UPDATE events SET title = ?, type = ?, time_from = ?, time_to = ? WHERE id = ? AND username = ?");
$stmt->bind_param("ssssis", $title, $type, $time_from, $time_to, $id, $username);

if ($stmt->execute()) {
    echo "Event updated";
} else {
    echo "Error: " . $stmt->error;
}
$stmt->close();
?>