document.addEventListener("DOMContentLoaded", function () {
  console.log("🔍 Page Loaded - Initializing Auth.js");

  // Get the login form element from the DOM
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent default form submission

      // Retrieve user input
      const username = document.getElementById("username")?.value;
      const password = document.getElementById("password")?.value;

      if (!username || !password) {
        alert("Please enter both username and password.");
        return;
      }

      // Send a POST request to the /login endpoint with credentials
      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for session persistence
        body: JSON.stringify({ username, password })
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            alert("Login failed: " + data.error);
          } else {
            console.log("✅ Login successful:", data);
            alert("Login successful!");

            // Redirect first, then fetch user info
            window.location.href = "dashboard.html";

            // Fetch user info after redirection (only when on dashboard)
            setTimeout(() => fetchUserInfo(), 1000);
          }
        })
        .catch(err => {
          console.error("❌ Fetch error:", err);
          alert("Login failed. Please try again.");
        });
    });
  }

  // Function to fetch user info
  function fetchUserInfo() {
    fetch('/api/user-info', { credentials: 'include' }) // Ensures session cookie is sent
        .then(response => response.json())
        .then(data => {
            console.log("🔍 User Info Response:", data);

            const usernameDisplay = document.getElementById("username-display");
            const userPhoto = document.getElementById("user-photo");

            if (!usernameDisplay || !userPhoto) {
                console.error("❌ UI Elements Not Found - Ensure IDs are correct in dashboard.html");
                return;
            }

            if (data.success) {
                usernameDisplay.textContent = `Hello, ${data.username}!`;
                userPhoto.src = data.userPhoto || "images/client-photo.png";
            } else {
                usernameDisplay.textContent = "Hello, Admin!";
            }
        })
        .catch(error => {
            console.error("❌ Error Fetching User Info:", error);
        });
  }
  fetchUserInfo();

  // Call fetchUserInfo only if on the dashboard page
  if (window.location.pathname.includes("dashboard.html")) {
    fetchUserInfo();
  }

  // Forgot Password Button
  const forgotPasswordButton = document.getElementById("forgot-password");
  if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href =
        "https://us-east-2wxph0lhec.auth.us-east-2.amazoncognito.com/forgotPassword?client_id=12kdtjv80rbe28jua8njbfgdug&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fadmin%2Fdashboard.html&response_type=code&scope=email+openid+phone";
    });
  }

  // Toggle password visibility
  const toggleCheckbox = document.getElementById("checkboxInput");
  const passwordField = document.getElementById("password");
  const toggleText = document.querySelector(".toggleText");

  if (toggleCheckbox && passwordField && toggleText) {
    toggleCheckbox.addEventListener("change", function () {
      passwordField.type = this.checked ? "text" : "password";
      toggleText.textContent = this.checked ? "Hide Password" : "Show Password";
    });
  }
});