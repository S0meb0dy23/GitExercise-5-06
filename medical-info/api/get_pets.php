<?php
$conn = new mysqli("localhost", "root", "", "server_db");
$pets = [];
$res = $conn->query("SELECT id, name FROM pets ORDER BY name");
while ($row = $res->fetch_assoc()) {
    $pets[] = $row;
}
echo json_encode($pets);
?>
