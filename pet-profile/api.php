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
$maxFileSize = 10 * 1024 * 1024;

switch ($method) {
    case 'GET':
        $stmt = $pdo->prepare("SELECT id, name, breed, age, weight FROM pets WHERE username = ?");
        $stmt->execute([$username]);
        $pets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($pets as &$pet) {
            $stmt = $pdo->prepare("SELECT avatar FROM pets WHERE id = ? AND username = ?");
            $stmt->execute([$pet['id'], $username]);
            $avatarData = $stmt->fetchColumn();
            $pet['avatar'] = $avatarData ? 'data:image/jpeg;base64,' . base64_encode($avatarData) : null;
        }
        
        echo json_encode($pets);
        break;

    case 'POST':
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if ($method === 'POST') {
            $stmt = $pdo->prepare("INSERT INTO pets (username, name, breed, age, weight) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$username, $data['name'], $data['breed'], $data['age'], $data['weight']]);
            $data['id'] = $pdo->lastInsertId();
        } else {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing pet ID']);
                exit;
            }
            
            $stmt = $pdo->prepare("UPDATE pets SET name=?, breed=?, age=?, weight=? WHERE id=? AND username=?");
            $stmt->execute([$data['name'], $data['breed'], $data['age'], $data['weight'], $id, $username]);
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
            
            // Delete gallery images first (with username check)
            $stmt = $pdo->prepare("DELETE FROM gallery WHERE pet_id = ? AND username = ?");
            $stmt->execute([$id, $username]);
           
            // Delete pet (with username check)
            $stmt = $pdo->prepare("DELETE FROM pets WHERE id = ? AND username = ?");
            $stmt->execute([$id, $username]);
            
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