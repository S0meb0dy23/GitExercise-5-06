<?php
session_start();
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// ✅ Use session to get logged-in user's ID
if (!isset($_SESSION['user_id'])) {
    die("Not logged in.");
}
$user_id = $_SESSION['user_id'];

// Get current user data
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
if (!$user) die("User not found.");

// Get updated fields or fallback to existing
$first_name = $_POST['first_name'] ?? $user['first_name'];
$last_name  = $_POST['last_name']  ?? $user['last_name'];
$username   = $_POST['username']   ?? $user['username'];
$bio        = $_POST['bio']        ?? $user['bio'];
$profile_image = $user['profile_image'];

// Handle profile image upload
if (!empty($_FILES['profile_image']['name'])) {
    $target_dir = "uploads/";
    $new_image = basename($_FILES["profile_image"]["name"]);
    $target_file = $target_dir . $new_image;
    if (move_uploaded_file($_FILES["profile_image"]["tmp_name"], $target_file)) {
        $profile_image = $new_image;
    }
}

// Build SQL and bind params
$password_sql = "";
$params = [$first_name, $last_name, $username, $bio, $profile_image];
$types = "sssss";

// If changing password
if (!empty($_POST['new_password']) && $_POST['new_password'] === $_POST['confirm_password']) {
    $new_password = password_hash($_POST['new_password'], PASSWORD_DEFAULT);
    $password_sql = ", password=?";
    $params[] = $new_password;
    $types .= "s";
}

$params[] = $user_id;
$types .= "i";

// Prepare and execute update
$sql = "UPDATE users SET first_name=?, last_name=?, username=?, bio=?, profile_image=?" . $password_sql . " WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();

header("Location: profile-settings.php?success=1");
exit;
?>
