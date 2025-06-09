<?php
$mysqli = new mysqli("localhost", "root", "", "calendar");
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}
?>