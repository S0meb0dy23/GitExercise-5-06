<?php
header('Content-Type: application/json');
require_once 'db.php';

ini_set('memory_limit', '256M');
set_time_limit(300);

$method = $_SERVER['REQUEST_METHOD'];
$petId = $_GET['pet_id'] ?? null;
$maxFileSize = 10 * 1024 * 1024; 

switch ($method) {
    case 'GET':
        if ($petId) {
            $stmt = $pdo->prepare("SELECT id, pet_id FROM gallery WHERE pet_id = ?");
            $stmt->execute([$petId]);
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($images as &$image) {
                $stmt = $pdo->prepare("SELECT image FROM gallery WHERE id = ?");
                $stmt->execute([$image['id']]);
                $imageData = $stmt->fetchColumn();
                $image['image'] = 'data:image/jpeg;base64,' . base64_encode($imageData);
            }
            
            echo json_encode($images);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Pet ID required']);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        

    $base64 = preg_replace('#^data:image/\w+;base64,#i', '', $data['image']);
    $sizeInBytes = (int)(strlen(rtrim($base64, '='))) * 3 / 4;

    if ($sizeInBytes > $maxFileSize) {
        http_response_code(413);
        echo json_encode(['error' => 'Image is too large. Maximum size is ' . ($maxFileSize / (1024 * 1024)) . 'MB.']);
        exit;
    }
        
        $imageData = base64_decode($base64);
        
        $stmt = $pdo->prepare("INSERT INTO gallery (pet_id, image) VALUES (?, ?)");
        $stmt->execute([$data['pet_id'], $imageData]);
        
        $id = $pdo->lastInsertId();
        echo json_encode(['id' => $id, 'pet_id' => $data['pet_id']]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Image ID required']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
}
?>