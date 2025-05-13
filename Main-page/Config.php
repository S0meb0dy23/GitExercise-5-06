<?php
$host = "localhost";
$db = "pawpulse";
$user = "root";
$pass = ""; // leave blank for XAMPP

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
