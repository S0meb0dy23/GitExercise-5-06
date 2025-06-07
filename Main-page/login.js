document.querySelector("form").addEventListener("submit", function (e) {
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  const usernameError = document.getElementById("username-error");
  const passwordError = document.getElementById("password-error");

  let isValid = true;

  usernameError.textContent = "";
  passwordError.textContent = "";

  if (username.value.trim().length < 5) {
    usernameError.textContent = "Username must be at least 5 characters.";
    isValid = false;
  }

  if (password.value.trim().length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    isValid = false;
  }

  if (!isValid) {
    e.preventDefault();
  }
});
