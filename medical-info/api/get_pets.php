<?php
session_start();
if (!isset($_SESSION['username'])) {
    die(json_encode([]));
}

$conn = new mysqli("localhost", "root", "", "server_db");
$username = $conn->real_escape_string($_SESSION['username']);
$pets = [];
$res = $conn->query("SELECT id, name FROM pets WHERE username = '$username' ORDER BY name");
while ($row = $res->fetch_assoc()) {
    $pets[] = $row;
}
echo json_encode($pets);
?>