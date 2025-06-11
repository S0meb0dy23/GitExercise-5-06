<?php
session_start();
$conn = new mysqli("localhost", "root", "", "user_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$user_id = 1;

$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
if (!$user) die("User not found.");

$first_name = $_POST['first_name'] ?? $user['first_name'];
$last_name  = $_POST['last_name']  ?? $user['last_name'];
$username   = $_POST['username']   ?? $user['username'];
$bio        = $_POST['bio']        ?? $user['bio'];
$profile_image = $user['profile_image'];

if (!empty($_FILES['profile_image']['name'])) {
    $target_dir = "uploads/";
    $new_image = basename($_FILES["profile_image"]["name"]);
    $target_file = $target_dir . $new_image;
    if (move_uploaded_file($_FILES["profile_image"]["tmp_name"], $target_file)) {
        $profile_image = $new_image;
    }
}

$password_sql = "";
$params = [$first_name, $last_name, $username, $bio, $profile_image];
$types = "sssss";

if (!empty($_POST['new_password']) && $_POST['new_password'] === $_POST['confirm_password']) {
    $new_password = password_hash($_POST['new_password'], PASSWORD_DEFAULT);
    $password_sql = ", password=?";
    $params[] = $new_password;
    $types .= "s";
}

$params[] = $user_id;
$types .= "i";


$sql = "UPDATE users SET first_name=?, last_name=?, username=?, bio=?, profile_image=?" . $password_sql . " WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();

header("Location: profile-settings.php?success=1");
exit;
?>
