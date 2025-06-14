<?php
header('Content-Type: application/json');
require_once 'db.php';

// Start session and verify user
session_start();
if (!isset($_SESSION['user_id']) || !isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
$username = $_SESSION['username'];

$method = $_SERVER['REQUEST_METHOD'];
$petId = $_GET['pet_id'] ?? null;
$maxFileSize = 10 * 1024 * 1024;

switch ($method) {
    case 'GET':
        if ($petId) {
            // Verify pet belongs to user first
            $stmt = $pdo->prepare("SELECT id FROM pets WHERE id = ? AND username = ?");
            $stmt->execute([$petId, $username]);
            if (!$stmt->fetch()) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden - pet not owned by user']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT id, pet_id FROM gallery WHERE pet_id = ? AND username = ?");
            $stmt->execute([$petId, $username]);
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($images as &$image) {
                $stmt = $pdo->prepare("SELECT image FROM gallery WHERE id = ? AND username = ?");
                $stmt->execute([$image['id'], $username]);
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
        
        // Verify pet belongs to user
        $stmt = $pdo->prepare("SELECT id FROM pets WHERE id = ? AND username = ?");
        $stmt->execute([$data['pet_id'], $username]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden - pet not owned by user']);
            exit;
        }

        $base64 = preg_replace('#^data:image/\w+;base64,#i', '', $data['image']);
        $sizeInBytes = (int)(strlen(rtrim($base64, '='))) * 3 / 4;

        if ($sizeInBytes > $maxFileSize) {
            http_response_code(413);
            echo json_encode(['error' => 'Image is too large. Maximum size is ' . ($maxFileSize / (1024 * 1024)) . 'MB.']);
            exit;
        }
        
        $imageData = base64_decode($base64);
        
        $stmt = $pdo->prepare("INSERT INTO gallery (username, pet_id, image) VALUES (?, ?, ?)");
        $stmt->execute([$username, $data['pet_id'], $imageData]);
        
        $id = $pdo->lastInsertId();
        echo json_encode(['id' => $id, 'pet_id' => $data['pet_id']]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if ($id) {
            // Verify image belongs to user
            $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ? AND username = ?");
            $stmt->execute([$id, $username]);
            if ($stmt->rowCount() === 0) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden - image not owned by user']);
                exit;
            }
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