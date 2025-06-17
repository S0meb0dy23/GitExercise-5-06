<?php
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed"]));
}