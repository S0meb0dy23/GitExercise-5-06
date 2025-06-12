<?php
session_start();
$conn = new mysqli("localhost", "root", "", "server_db");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) die("User not found.");

$profileImage = !empty($user['profile_image']) ? 'uploads/' . $user['profile_image'] : 'assets/default-avatar.png';
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>My Profile Settings</title>
  <link rel="stylesheet" href="profile.css"/>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"/>
</head>
<body>
  <div class="profile-container">
    <header class="profile-header">
      <div class="avatar-wrapper">
        <img id="profilePreview" src="<?= $profileImage ?>" alt="Profile" class="profile-avatar" />
        <form method="POST" action="update-profile.php" enctype="multipart/form-data">
          <label for="profile_image" class="camera-icon">
            <i class="fas fa-camera"></i>
          </label>
          <input type="file" name="profile_image" id="profile_image" accept="image/*" onchange="this.form.submit();" style="display: none;">
        </form>
      </div>

      <h1 class="profile-title">Account Settings</h1>
      <p class="profile-subtitle">Manage your personal information</p>

      <?php if (isset($_GET['success']) && $_GET['success'] == '1') : ?>
        <p class="success-msg">✅ Profile updated!</p>
      <?php elseif (isset($_SESSION['update_errors'])) : ?>
        <div class="error-messages">
          <?php foreach ($_SESSION['update_errors'] as $error) : ?>
            <p class="error-msg">❌ <?= htmlspecialchars($error) ?></p>
          <?php endforeach; unset($_SESSION['update_errors']); ?>
        </div>
      <?php endif; ?>
    </header>

    <main class="profile-content">
      <form class="settings-form" method="POST" action="update-profile.php" enctype="multipart/form-data">
        <section class="form-section">
          <h2 class="section-title"><i class="fas fa-user section-icon"></i> Personal Information</h2>
          <div class="input-group">
            <div class="input-row">
              <div class="input-field">
                <label for="first-name">First Name</label>
                <input type="text" name="first_name" id="first-name" value="<?= htmlspecialchars($user['first_name']) ?>">
              </div>
              <div class="input-field">
                <label for="last-name">Last Name</label>
                <input type="text" name="last_name" id="last-name" value="<?= htmlspecialchars($user['last_name']) ?>">
              </div>
            </div>
            <div class="input-field">
              <label for="username">Username</label>
              <div class="input-with-prefix">
                <span class="input-prefix">@</span>
                <input type="text" name="username" id="username" value="<?= htmlspecialchars($user['username']) ?>">
              </div>
            </div>
            <div class="input-field">
              <label for="bio">Note</label>
              <textarea name="bio" id="bio" maxlength="150"><?= htmlspecialchars($user['bio']) ?></textarea>
              <div class="char-count" id="bio-count">0/150</div>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h2 class="section-title"><i class="fas fa-lock section-icon"></i> Security</h2>
          <div class="input-group">
            <div class="input-field">
              <label for="current-password">Current Password</label>
              <div class="password-input">
                <input type="password" name="current_password" id="current-password" placeholder="••••••••">
                <button type="button" class="toggle-password"><i class="fas fa-eye"></i></button>
              </div>
            </div>

            <div class="input-row">
              <div class="input-field">
                <label for="new-password">New Password</label>
                <div class="password-input">
                  <input type="password" name="new_password" id="new-password" placeholder="••••••••">
                  <button type="button" class="toggle-password"><i class="fas fa-eye"></i></button>
                </div>
              </div>

              <div class="input-field">
                <label for="confirm-password">Confirm Password</label>
                <div class="password-input">
                  <input type="password" name="confirm_password" id="confirm-password" placeholder="••••••••">
                  <button type="button" class="toggle-password"><i class="fas fa-eye"></i></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="form-actions">
          <button type="reset" class="btn btn-outline"><i class="fas fa-times"></i> Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Changes</button>
        </div>
      </form>
    </main>
  </div>

  <script>
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.innerHTML = input.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
      });
    });

    // Live bio character counter
    const bio = document.getElementById('bio');
    const count = document.getElementById('bio-count');

    function updateCharCount() {
      count.textContent = `${bio.value.length}/600`;
    }

    bio.addEventListener('input', updateCharCount);
    window.addEventListener('DOMContentLoaded', updateCharCount); // update on load
  </script>
</body>
</html>
