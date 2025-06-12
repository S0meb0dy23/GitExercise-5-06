<?php
$conn = new mysqli("localhost", "root", "", "server_db");
$pet_id = intval($_GET['pet_id'] ?? 0);
$data = ['vaccination' => [], 'medication' => [], 'condition' => []];

if ($pet_id > 0) {
    $stmt = $conn->prepare("SELECT * FROM medical_records WHERE pet_id = ?");
    $stmt->bind_param("i", $pet_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $data[$row['type']][] = ['desc' => $row['description'], 'info' => $row['info']];
    }
}

echo json_encode($data);
?>
