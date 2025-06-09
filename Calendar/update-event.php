<?php
include 'db.php';

$id = $_POST['id'];
$title = $_POST['title'];
$type = $_POST['type'];
$time_from = $_POST['time_from'];
$time_to = $_POST['time_to'];

$stmt = $mysqli->prepare("UPDATE events SET title = ?, type = ?, time_from = ?, time_to = ? WHERE id = ?");
$stmt->bind_param("ssssi", $title, $type, $time_from, $time_to, $id);

if ($stmt->execute()) {
    echo "Event updated";
} else {
    echo "Error: " . $stmt->error;
}
$stmt->close();
?>