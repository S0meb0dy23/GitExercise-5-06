<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


require 'PHPMailer-master/src/Exception.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';


ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


$conn = new mysqli("localhost", "root", "", "user_db");
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
        echo "❌ Email already registered!";
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
                $mail->Password = 'pges mtao qppk fzkh';   // app password do not touch
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
                echo "✅ Registration successful! Please check your email to verify your account.";
            } catch (Exception $e) {
                echo "❌ Email could not be sent. Error: {$mail->ErrorInfo}";
            }
        } else {
            echo "❌ Database error: " . $conn->error;
        }
    }

    $conn->close();
}
?>
