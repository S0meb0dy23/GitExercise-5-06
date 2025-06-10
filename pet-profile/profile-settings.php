<?php
session_start();
$conn = new mysqli("localhost", "root", "", "user_db");

if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit;
}

$username = $_SESSION['username'];
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();
$conn->close();

// Set profile image path (fallback to default)
$profileImage = !empty($user['profile_image']) && file_exists('uploads/' . $user['profile_image'])
    ? 'uploads/' . htmlspecialchars($user['profile_image'])
    : 'assets/default.jpg'; // Make sure this default.jpg exists in assets/
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
  <style>
    .profile-avatar {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 50%;
      border: 3px solid #ccc;
    }
    .avatar-wrapper {
      position: relative;
      display: inline-block;
    }
    .camera-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #fff;
      border-radius: 50%;
      padding: 6px;
      cursor: pointer;
    }
    input[type="file"] {
      display: none;
    }
  </style>
</head>
<body>
  <div class="profile-container">
    <header class="profile-header">
      <div class="avatar-wrapper">
        <img id="profilePreview" src="<?= $profileImage ?>" alt="Profile" class="profile-avatar"/>
        <label for="profile_image" class="camera-icon">
          <i class="fas fa-camera"></i>
        </label>
        <form method="POST" enctype="multipart/form-data" action="update-profile.php">
          <input type="file" name="profile_image" id="profile_image" accept="image/*" onchange="this.form.submit();"/>
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
              <label for="bio">Bio</label>
              <textarea name="bio" id="bio"><?= htmlspecialchars($user['bio']) ?></textarea>
              <div class="char-count">0/150</div>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h2 class="section-title"><i class="fas fa-envelope section-icon"></i> Contact Information</h2>
          <div class="input-group">
            <div class="input-field">
              <label for="email">Email Address</label>
              <div class="input-with-badge">
                <input type="email" name="email" id="email" value="<?= htmlspecialchars($user['email']) ?>">
                <span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>
              </div>
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
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.innerHTML = input.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
      });
    });
  </script>
</body>
</html>
