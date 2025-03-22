// Display an error text field message after a failed login
async function loginFailure(textField) {
  textField.value = "Login Failed: Incorrect Username or Password";
  document.querySelector(".errorBox").style.display = "block";
  let failedAttempts = parseInt(localStorage.getItem('failedAttempts') || '0', 10);
  // Increment failedAttempts vlaue after a failed login
  failedAttempts++;
  localStorage.setItem('failedAttempts', failedAttempts);
 }
 
 // Reload the page after the set timer
 async function reloadPage() {
  setTimeout(() => {
    location.reload();
  }, 1000);
 }
 
document.addEventListener("DOMContentLoaded", function() {

  // Get the login form element from the DOM
  const loginForm = document.getElementById("login-form");

  // Keep count of number of failed login attempts
  let failedAttempts = 0;

  const recaptchaDisplay = document.getElementById('recaptcha-display');
  const recaptchaExit = document.getElementById('recaptcha-exit');
  const textField = document.getElementById('textField');
  textField.style.display = "block";

  // Store count of failedAttempts after page refreshes
  if (localStorage.getItem('failedAttempts')) {
    failedAttempts = parseInt(localStorage.getItem('failedAttempts'));
  }

  // verify the recaptcha challenge
  window.captchaVerified = function(token) {
    recaptchaDisplay.style.display = "none";
    document.getElementById("captchaToken").value = token;
    // reset the counter after a successful login
    failedAttempts = 0;
    localStorage.setItem('failedAttempts', failedAttempts);
  };

  // Close recaptcha display if x is clicked
  recaptchaExit.addEventListener("click", () => {
    recaptchaDisplay.style.display = "none";
  });

  // Closes recaptcha display if clicked outside the display box
  window.onclick = function(event) {
    if (event.target === recaptchaDisplay) {
      recaptchaDisplay.style.display = "none";
    }
  };
 
  // Listen for form submission
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
 
    // Retrieve the values entered by the user
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Display recaptcha challenge after the user inputs a certain amount of failed logins
    if (failedAttempts >= 3 && grecaptcha.getResponse() === "") {
      alert("Please complete the reCAPTCHA to proceed.");
      recaptchaDisplay.style.display = 'block';
      return; 
    }
 
    // Send a POST request to the /login endpoint with the username and password
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        loginFailure(textField);
        reloadPage();
       
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

module.exports = {
  loginFailure,
  reloadPage
 };
 