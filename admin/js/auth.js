document.addEventListener("DOMContentLoaded", function() {

  // Get the login form element from the DOM
  const loginForm = document.getElementById("login-form");
 
  // Listen for form submission
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
 
    // Retrieve the values entered by the user
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
 
    // Send a POST request to the /login endpoint with the username and password
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Login failed: " + data.error);
      } else {
        console.log("Login successful:", data);
    
        // Store the Cognito JWT Token in localStorage
        localStorage.setItem("id_token", data.AuthenticationResult.IdToken);
    
        // Redirect to dashboard
        window.location.href = "dashboard.html?auth=true";
      }
    })
    .catch(err => {
      console.error("Fetch error:", err);
      alert("Login failed. Please try again.");
    });
    
  });

  // Adding an event listener to the forgot password button
  const forgotPasswordButton = document.getElementById("forgot-password");
  forgotPasswordButton.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default link behavior
    // Redirect to the AWS Cognito forgot password page
    window.location.href = "https://us-east-2wxph0lhec.auth.us-east-2.amazoncognito.com/forgotPassword?client_id=12kdtjv80rbe28jua8njbfgdug&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fadmin%2Fdashboard.html&response_type=code&scope=email+openid+phone";
  });

  // Toggle password visibility
  const toggleCheckbox = document.getElementById('checkboxInput');
  const passwordField = document.getElementById('password');
  const toggleText = document.querySelector('.toggleText'); // using the class toggleText

  // Listen for changes on the toggle checkbox to show/hide the password
  toggleCheckbox.addEventListener('change', function() {
    if (this.checked) {
      passwordField.type = 'text';
      toggleText.textContent = 'Hide Password';
    } else {
      passwordField.type = 'password';
      toggleText.textContent = 'Show Password';
    }
  });
});