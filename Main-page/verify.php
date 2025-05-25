<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "user_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_GET['token'])) {
    $token = $_GET['token'];

    $stmt = $conn->prepare("SELECT email, is_verified FROM users WHERE verify_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if ($user['is_verified'] == 1) {
            echo "<script>
                alert('Your account is already verified!');
                window.location.href = 'login.html';
            </script>";
        } else {
            $update = $conn->prepare("UPDATE users SET is_verified = 1, verify_token = NULL WHERE verify_token = ?");
            $update->bind_param("s", $token);
            if ($update->execute()) {
                echo "<script>
                    alert('Your account has been successfully verified!');
                    window.location.href = 'login.html';
                </script>";
            } else {
                echo "Error updating verification status. Please try again.";
            }
            $update->close();
        }
    } else {
        echo "❌ Invalid verification token.";
    }

    $stmt->close();
} else {
    echo "❌ No verification token provided.";
}

$conn->close();
?>
