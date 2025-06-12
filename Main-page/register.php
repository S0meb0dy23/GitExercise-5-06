<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer-master/src/Exception.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$successMessage = "";
$errorMessage = "";

$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $conn->real_escape_string($_POST['username']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $checkSql = "SELECT * FROM users WHERE email='$email'";
    $result = $conn->query($checkSql);

    if ($result->num_rows > 0) {
        $errorMessage = "❌ Email already registered!";
    } else {
        $token = bin2hex(random_bytes(50));
        $is_verified = 0;

        $sql = "INSERT INTO users (username, email, password, verify_token, is_verified)
                VALUES ('$username', '$email', '$password', '$token', $is_verified)";

        if ($conn->query($sql) === TRUE) {
            $mail = new PHPMailer(true);

            try {
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = 'pawpulse7@gmail.com';
                $mail->Password = 'pges mtao qppk fzkh'; // app password do not touch 
                $mail->SMTPSecure = 'ssl';
                $mail->Port = 465;

                $mail->SMTPOptions = [
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true,
                    ],
                ];

                $mail->setFrom('pawpulse7@gmail.com', 'PawPulse');
                $mail->addAddress($email, $username);
                $mail->isHTML(true);
                $mail->Subject = 'Verify your email address';
                $mail->Body = "
                    Hi $username,<br><br>
                    Please click the link below to verify your email address:<br>
                    <a href='http://localhost/Main-page/verify.php?token=$token'>Verify Email</a><br><br>
                    Thank you!
                ";

                $mail->send();
                $successMessage = "✅ Registration successful! Please check your email to verify your account.";
            } catch (Exception $e) {
                $errorMessage = "❌ Email could not be sent. Error: " . $mail->ErrorInfo;
            }
        } else {
            $errorMessage = "❌ Database error: " . $conn->error;
        }
    }

    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PawPulse - Register</title>
    <link rel="stylesheet" href="register.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cute+Font&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
</head>
<body>
    <div class="Registerpage">
        <?php if (!empty($successMessage)): ?>
            <div class="success-message"><?php echo $successMessage; ?></div>
        <?php endif; ?>
        <?php if (!empty($errorMessage)): ?>
            <div class="error-message"><?php echo $errorMessage; ?></div>
        <?php endif; ?>

        <form action="register.php" method="post">
            <h1>Register</h1>
            <div class="container">
                <input type="text" placeholder="Username" name="username" required>
                <i class="fa fa-user"></i>
            </div>
            <div class="container">
                <input type="email" placeholder="Email" name="email" required>
                <i class="fa fa-envelope"></i>
            </div>
            <div class="container">
                <input type="password" placeholder="Password" name="password" required>
                <i class="fa fa-lock"></i>
            </div>
            <div class="container">
                <input type="password" placeholder="Confirm Password" name="confirm_password" required>
                <i class="fa fa-lock"></i>
            </div>
            <button type="submit" class="btn">Submit</button>
        </form> 
    </div>
</body>
</html>
