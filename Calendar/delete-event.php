<?php
include 'db.php';

$id = $_POST['id'];

$stmt = $mysqli->prepare("DELETE FROM events WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo "Event deleted";
} else {
    echo "Error: " . $stmt->error;
}
$stmt->close();
?>