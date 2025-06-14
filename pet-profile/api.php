<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

ini_set('memory_limit', '256M');
set_time_limit(300);

$method = $_SERVER['REQUEST_METHOD'];
$maxFileSize = 10 * 1024 * 1024; 

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$username = $_SESSION['username'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->prepare("SELECT id, name, breed, age, weight FROM pets WHERE username = ?");
        $stmt->execute([$username]);
        $pets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($pets as &$pet) {
            $stmt = $pdo->prepare("SELECT avatar FROM pets WHERE id = ?");
            $stmt->execute([$pet['id']]);
            $avatarData = $stmt->fetchColumn();
            $pet['avatar'] = $avatarData ? 'data:image/jpeg;base64,' . base64_encode($avatarData) : null;
        }
        
        echo json_encode($pets);
        break;

    case 'POST':
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if ($method === 'POST') {
            $stmt = $pdo->prepare("INSERT INTO pets (name, breed, age, weight, username) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['breed'], $data['age'], $data['weight'], $username]);
            $data['id'] = $pdo->lastInsertId();
        } else {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing pet ID']);
                exit;
            }
            
            // Verify pet belongs to user before updating
            $stmt = $pdo->prepare("SELECT id FROM pets WHERE id = ? AND username = ?");
            $stmt->execute([$id, $username]);
            if (!$stmt->fetch()) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                exit;
            }
            
            $stmt = $pdo->prepare("UPDATE pets SET name=?, breed=?, age=?, weight=? WHERE id=?");
            $stmt->execute([$data['name'], $data['breed'], $data['age'], $data['weight'], $id]);
            $data['id'] = $id;
        }
        
        $response = [
            'id' => $data['id'],
            'name' => $data['name'],
            'breed' => $data['breed'],
            'age' => $data['age'],
            'weight' => $data['weight'],
            'avatar' => null
        ];
        
        echo json_encode($response);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing pet ID']);
            exit;
        }
        
        try {
            $pdo->beginTransaction();
            
            // Verify pet belongs to user before deleting
            $stmt = $pdo->prepare("SELECT id FROM pets WHERE id = ? AND username = ?");
            $stmt->execute([$id, $username]);
            if (!$stmt->fetch()) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                exit;
            }
            
            $stmt = $pdo->prepare("DELETE FROM gallery WHERE pet_id = ?");
            $stmt->execute([$id]);
           
            $stmt = $pdo->prepare("DELETE FROM pets WHERE id = ?");
            $stmt->execute([$id]);
            
            $pdo->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete pet']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
}
?>