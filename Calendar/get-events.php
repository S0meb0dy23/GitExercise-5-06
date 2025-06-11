<?php
include 'db.php';

$result = $mysqli->query("SELECT * FROM events");
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