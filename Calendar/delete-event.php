<?php
session_start();
include 'db.php';

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    die("Unauthorized");
}

$username = $_SESSION['username'];
$result = $mysqli->prepare("SELECT * FROM events WHERE username = ?");
$result->bind_param("s", $username);
$result->execute();
$result = $result->get_result();

$events = [];
while($row = $result->fetch_assoc()) {
    $events[] = [
        'id' => $row['id'],
        'title' => $row['title'],
        'type' => $row['type'],
        'time_from' => $row['time_from'],
        'time_to' => $row['time_to'],
        'day' => $row['day'],
        'month' => $row['month'],
        'year' => $row['year']
    ];
}

echo json_encode($events);
?>