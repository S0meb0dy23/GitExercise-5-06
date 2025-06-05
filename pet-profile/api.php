<?php
header('Content-Type: application/json');
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$resource = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));

switch ($resource) {
    case 'pets':
        handlePets($method, $request);
        break;
    case 'medical':
        handleMedicalRecords($method, $request);
        break;
    case 'weight':
        handleWeightEntries($method, $request);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
        break;
}

function handlePets($method, $request) {
    global $pdo;
    
    switch ($method) {
        case 'GET':
            $stmt = $pdo->query("SELECT * FROM pets");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $pdo->prepare("INSERT INTO pets (name, breed, age, weight, avatar) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['breed'], $data['age'], $data['weight'], $data['avatar']]);
            $data['id'] = $pdo->lastInsertId();
            echo json_encode($data);
            break;
            
        case 'PUT':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing pet ID']);
                exit;
            }
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $pdo->prepare("UPDATE pets SET name=?, breed=?, age=?, weight=?, avatar=? WHERE id=?");
            $stmt->execute([$data['name'], $data['breed'], $data['age'], $data['weight'], $data['avatar'], $id]);
            $data['id'] = $id;
            echo json_encode($data);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
    }
}

function handleMedicalRecords($method, $request) {
    global $pdo;
    $pet_id = $_GET['pet_id'] ?? null;
    
    if (!$pet_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing pet_id parameter']);
        return;
    }
    
    switch ($method) {
        case 'GET':
            $stmt = $pdo->prepare("SELECT * FROM medical_records WHERE pet_id = ?");
            $stmt->execute([$pet_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $pdo->prepare("INSERT INTO medical_records (pet_id, type, description, info, record_date) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$pet_id, $data['type'], $data['description'], $data['info'], $data['date'] ?? date('Y-m-d')]);
            $data['id'] = $pdo->lastInsertId();
            echo json_encode($data);
            break;
            
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing record ID']);
                return;
            }
            $stmt = $pdo->prepare("DELETE FROM medical_records WHERE id = ? AND pet_id = ?");
            $stmt->execute([$id, $pet_id]);
            echo json_encode(['success' => $stmt->rowCount() > 0]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
    }
}

function handleWeightEntries($method, $request) {
    global $pdo;
    $pet_id = $_GET['pet_id'] ?? null;
    
    if (!$pet_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing pet_id parameter']);
        return;
    }
    
    switch ($method) {
        case 'GET':
            $stmt = $pdo->prepare("SELECT * FROM weight_entries WHERE pet_id = ? ORDER BY entry_date ASC");
            $stmt->execute([$pet_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Check if entry already exists for this date
            $checkStmt = $pdo->prepare("SELECT id FROM weight_entries WHERE pet_id = ? AND entry_date = ?");
            $checkStmt->execute([$pet_id, $data['date']]);
            if ($checkStmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Weight entry already exists for this date']);
                return;
            }
            
            $stmt = $pdo->prepare("INSERT INTO weight_entries (pet_id, weight, entry_date) VALUES (?, ?, ?)");
            $stmt->execute([$pet_id, $data['weight'], $data['date']]);
            $data['id'] = $pdo->lastInsertId();
            echo json_encode($data);
            break;
            
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing weight entry ID']);
                return;
            }
            $stmt = $pdo->prepare("DELETE FROM weight_entries WHERE id = ? AND pet_id = ?");
            $stmt->execute([$id, $pet_id]);
            echo json_encode(['success' => $stmt->rowCount() > 0]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
    }
}
?>