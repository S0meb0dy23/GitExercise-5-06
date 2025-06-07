<?php
header('Content-Type: application/json');
require_once 'db.php';

ini_set('memory_limit', '256M');
set_time_limit(300);

$method = $_SERVER['REQUEST_METHOD'];
$maxFileSize = 10 * 1024 * 1024; 

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, name, breed, age, weight FROM pets");
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
            $stmt = $pdo->prepare("INSERT INTO pets (name, breed, age, weight) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['breed'], $data['age'], $data['weight']]);
            $data['id'] = $pdo->lastInsertId();
        } else {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing pet ID']);
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