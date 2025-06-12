<?php
$conn = new mysqli("localhost", "root", "", "server_db");
$pet_id = intval($_POST['pet_id']);
$date = $_POST['date'];
$weight = floatval($_POST['weight']);

$stmt = $conn->prepare("INSERT INTO weight_records (pet_id, record_date, weight) VALUES (?, ?, ?)");
$stmt->bind_param("isd", $pet_id, $date, $weight);
if ($stmt->execute()) {
    echo "success";
} else {
    echo "error";
}
?>
