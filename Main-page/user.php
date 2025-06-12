<?php
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $conn->query("DELETE FROM users WHERE id=$id");
    header("Location: users.php");
    exit();
}

$result = $conn->query("SELECT id, username, email FROM users");
?>

<!DOCTYPE html>
<html>
<head>
    <title>User List</title>
</head>
<body>
    <h2>Registered Users</h2>
    <table border="1" cellpadding="10">
        <tr>
            <th>ID</th><th>Username</th><th>Email</th><th>Action</th>
        </tr>
        <?php while ($row = $result->fetch_assoc()) { ?>
        <tr>
            <td><?= $row['id']; ?></td>
            <td><?= $row['username']; ?></td>
            <td><?= $row['email']; ?></td>
            <td>
                <a href="users.php?delete=<?= $row['id']; ?>" onclick="return confirm('Are you sure?')">Remove</a>
            </td>
        </tr>
        <?php } ?>
    </table>
</body>
</html>
