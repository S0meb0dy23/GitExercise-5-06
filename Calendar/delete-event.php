<?php
header("Content-Type: application/json");

include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = intval($data["id"]);

$sql = "DELETE FROM events WHERE id = $id";

if ($conn->query($sql) === TRUE) {
  echo json_encode(["status" => "success"]);
} else {
  echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>