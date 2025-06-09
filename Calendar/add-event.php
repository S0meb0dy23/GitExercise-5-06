<?php
include 'db.php';

$title = $_POST['title'];
$type = $_POST['type'];
$time_from = $_POST['time_from'];
$time_to = $_POST['time_to'];
$day = $_POST['day'];
$month = $_POST['month'];
$year = $_POST['year'];

$stmt = $mysqli->prepare("INSERT INTO events (title, type, time_from, time_to, day, month, year) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssiii", $title, $type, $time_from, $time_to, $day, $month, $year);

if ($stmt->execute()) {
    echo "Event added";
} else {
    echo "Error: " . $stmt->error;
}
$stmt->close();
?>