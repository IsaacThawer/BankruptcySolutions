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

 /*
// Function to delete a user using adminDeleteUser
function deleteUser(username) {
 var params = {
   UserPoolId: "us-east-2_WXPh0LHEc",  // Your User Pool ID
   Username: username
 };
 cognitoISP.adminDeleteUser(params, function(err, data) {
   if (err) {
     console.error("Error deleting user:", err);
     alert("Error deleting user: " + err.message);
   } else {
     console.log("User deleted successfully:", data);
     alert("User deleted successfully!");
     loadUsers();  // Refresh the user list
} });
}
*/
/*
function loadUsers() {
 var params = {
   UserPoolId: "us-east-2_WXPh0LHEc",  // Your User Pool ID
   Limit: 60
 };
 cognitoISP.listUsers(params, function(err, data) {
   if (err) {
     console.error("Error listing users:", err);
     alert("Error listing users: " + err.message);
   } else {
     var userList = document.getElementById("user-list");
     if (!userList) return;
     userList.innerHTML = "";  // Clear existing list
     data.Users.forEach(function(user) {
       let email = "";
       let role = "";
       // Extract email and any custom attributes
       user.Attributes.forEach(function(attr) {
         if (attr.Name === "email") email = attr.Value;
         if (attr.Name === "custom:role") role = attr.Value;
       });
       // Create table row for each user

        var tr = document.createElement("tr");
       tr.innerHTML = `
         <td>${user.Username}</td>
         <td>${email}</td>
         <td>${role || "N/A"}</td>
         <td><button class="delete-btn">Delete</button></td>
       `;
       // Add delete handler for the button
       tr.querySelector(".delete-btn").addEventListener("click", function() {
         if (confirm("Are you sure you want to delete user " + user.Username + "?")) {
           deleteUser(user.Username);
} });
       userList.appendChild(tr);
     });
} });
} */

function updateContent(page) {
   if (pages[page]) {
     // Update the content
     contentSection.innerHTML = pages[page];
     /*
     if (page === "modify-users") {
       // Attach event listener for the add-user form
       var form = document.getElementById("modify-user-form");
       form.addEventListener("submit", function(event) {
         event.preventDefault();
         var username = document.getElementById("modify-username").value;
         var email = document.getElementById("modify-email").value;
         var password = document.getElementById("modify-password").value;
         addUser(username, email, password);
       });
        // Load the existing users from Cognito
       loadUsers();
     }

else {
     console.log("Credentials loaded successfully");
     // load Users here.
     loadUsers();
     */
    }
}

//Insert loadUsers();
