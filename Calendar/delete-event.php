<?php
include 'db.php';

if (isset($_POST['id'])) {
  $id = $_POST['id'];

  $stmt = $mysqli->prepare("DELETE FROM events WHERE id = ?");
  $stmt->bind_param("i", $id);

  if ($stmt->execute()) {
    echo "Event deleted";
  } else {
    echo "Error deleting event: " . $stmt->error;
  }
  $stmt->close();
} else {
  echo "No event ID received";
}
?>