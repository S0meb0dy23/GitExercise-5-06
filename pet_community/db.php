<?php
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
