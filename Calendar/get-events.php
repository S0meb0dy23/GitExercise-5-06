<?php
header("Content-Type: application/json");

include 'db.php';

$sql = "SELECT * FROM events";
$result = $conn->query($sql);

$events = array();
while($row = $result->fetch_assoc()) {
   $events[] = [
    "id" => (int)$row["id"],
    "title" => $row["title"],
    "type" => $row["type"],
    "time_from" => $row["time_from"],
    "time_to" => $row["time_to"],
    "day" => (int)$row["day"],
    "month" => (int)$row["month"],
    "year" => (int)$row["year"]
  ];
}

echo json_encode($events);
$conn->close();
?>