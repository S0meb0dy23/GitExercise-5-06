<?php
$conn = new mysqli("localhost", "root", "", "pet_community");
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
