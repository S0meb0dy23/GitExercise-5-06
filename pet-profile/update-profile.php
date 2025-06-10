<?php
session_start();
$conn = new mysqli("localhost", "root", "", "user_db");

if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}

$username = $_SESSION['username'];

// Collect input fields
$first_name = $_POST['first_name'] ?? '';
$last_name = $_POST['last_name'] ?? '';
$new_username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$bio = $_POST['bio'] ?? '';
$current_password = $_POST['current_password'] ?? '';
$new_password = $_POST['new_password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

$errors = [];

// Upload profile image if provided
$profile_image_name = null;
if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $file_tmp = $_FILES['profile_image']['tmp_name'];
    $file_type = mime_content_type($file_tmp);

    if (in_array($file_type, $allowed_types)) {
        $ext = pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION);
        $new_name = uniqid("img_", true) . "." . $ext;
        $upload_path = "uploads/" . $new_name;

        if (move_uploaded_file($file_tmp, $upload_path)) {
            $profile_image_name = $new_name;
        } else {
            $errors[] = "Failed to move uploaded file.";
        }
    } else {
        $errors[] = "Only JPG, PNG, GIF, and WEBP images are allowed.";
    }
}

// Password change
if (!empty($new_password) && $new_password !== $confirm_password) {
    $errors[] = "New passwords do not match.";
}

// Fetch existing user to validate current password
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
$stmt->bind_param("s", $_SESSION['username']);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!empty($new_password) && !password_verify($current_password, $user['password'])) {
    $errors[] = "Current password is incorrect.";
}

if (!empty($errors)) {
    $_SESSION['update_errors'] = $errors;
    header("Location: profile-settings.php");
    exit;
}

// Update user
$fields = [
    "first_name = ?",
    "last_name = ?",
    "username = ?",
    "email = ?",
    "bio = ?"
];
$params = [$first_name, $last_name, $new_username, $email, $bio];
$types = "sssss";

if (!empty($profile_image_name)) {
    $fields[] = "profile_image = ?";
    $params[] = $profile_image_name;
    $types .= "s";
}

if (!empty($new_password)) {
    $fields[] = "password = ?";
    $params[] = password_hash($new_password, PASSWORD_DEFAULT);
    $types .= "s";
}

$params[] = $_SESSION['username'];
$types .= "s";

$sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$stmt->close();

// Update session username if changed
$_SESSION['username'] = $new_username;

header("Location: profile-settings.php?success=1");
exit;
?>
