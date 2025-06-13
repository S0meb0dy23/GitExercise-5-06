<?php
session_start();
include 'db.php';

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    die("Unauthorized");
}

$title = $_POST['title'];
$type = $_POST['type'];
$time_from = $_POST['time_from'];
$time_to = $_POST['time_to'];
$day = $_POST['day'];
$month = $_POST['month'];
$year = $_POST['year'];
$username = $_SESSION['username'];

$stmt = $mysqli->prepare("INSERT INTO events (title, type, time_from, time_to, day, month, year, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssiiis", $title, $type, $time_from, $time_to, $day, $month, $year, $username);

if ($stmt->execute()) {
    echo "Event added";
} else {
    echo "Error: " . $stmt->error;
}
$stmt->close();
?>