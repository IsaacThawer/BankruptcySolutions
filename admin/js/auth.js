document.addEventListener("DOMContentLoaded", function() {

  const loginForm = document.getElementById("login-form");
 
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
 
 
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
 
 
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if(data.error) {
        alert("Login failed: " + data.error);
      } else {
        console.log("Login successful:", data);
        alert("Login successful!");
        window.location.href = "dashboard.html";
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
    // Redirect to AWS Cognito forgot password page
    window.location.href = "https://us-east-2wxph0lhec.auth.us-east-2.amazoncognito.com/forgotPassword?client_id=12kdtjv80rbe28jua8njbfgdug&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fadmin%2Fdashboard.html&response_type=code&scope=email+openid+phone";
  });

  // Toggle password script
  const toggleCheckbox = document.getElementById('checkboxInput');
  const passwordField = document.getElementById('password');
  const toggleText = document.querySelector('.toggleText'); // using the class toggleText

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


 