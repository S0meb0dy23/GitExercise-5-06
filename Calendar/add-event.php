<?php
header("Content-Type: application/json");

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$title = $conn->real_escape_string($data["title"]);
$type = $conn->real_escape_string($data["type"]);
$time_from = $conn->real_escape_string($data["time_from"]);
$time_to = $conn->real_escape_string($data["time_to"]);
$day = intval($data["day"]);
$month = intval($data["month"]);
$year = intval($data["year"]);

$sql = "INSERT INTO events (title, type, time_from, time_to, day, month, year)
        VALUES ('$title', '$type', '$time_from', '$time_to', $day, $month, $year)";

if ($conn->query($sql) === TRUE) {
  echo json_encode(["status" => "success", "id" => $conn->insert_id]);
} else {
  echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>