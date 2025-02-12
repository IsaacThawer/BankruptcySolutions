/*
// AWS Cognito Configuration for the authorization of the login form
const poolData = {
  UserPoolId: "us-east-2_WXPh0LHEc", // Replace with Product owner User Pool ID (Find in Cognito)
  ClientId: "12kdtjv80rbe28jua8njbfgdug" // Replace with Product owner Client ID (Find in Cognito -> App Clients)
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData); 

document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", function(event) {
      event.preventDefault();
      
      // use the username and password values for the cognito identity
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
          Username: username,
          Password: password,
      });

      const userData = {
          Username: username,
          Pool: userPool
      };

      const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function(session) {
              console.log("Login successful:", session);
              alert("Login successful!");
              window.location.href = "dashboard.html"; // Redirect user after login to the dashboard. AWS is configured to 
          },
          onFailure: function(err) {
              console.error("Login failed:", err);
              alert("Login failed: " + err.message);
          }
      });
  });
});
*/