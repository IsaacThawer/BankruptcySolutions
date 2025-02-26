/*
AWS.config.region = "us-east-2"; // Replace with Client AWS region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "us-east-2:a449733c-41bb-4368-afa5-456c0b390d80" // Replace with Client Cognito Identity Pool ID
});
AWS.config.credentials.get(function(err) {
  if (err) {
      console.error("Error retrieving credentials:", err);
      alert("Error retrieving AWS credentials: " + err.message);
  } else {
      console.log("Credentials loaded successfully");
      
  }
});
*/

document.addEventListener("DOMContentLoaded", function () {
  const contentSection = document.getElementById("dynamic-content");
  const navLinks = document.querySelectorAll("nav a");

  // Check if the dynamic content section exists
  if (!contentSection) {
    console.error("Error: #dynamic-content section not found!");
    return;
  }

  // Define content for each section
  const pages = {
    "home": `
      <section id="rectangle-24">
        <h1>Edit Home Page</h1>
  
        <div class="page-section">
          <label for="home-page-title">Home Page Title</label>
          <textarea id="home-page-title" rows="1"></textarea>
          <button class="button" onclick="saveText('home-page-title', 'index-title.txt')">Update</button>
        </div>
  
        <div class="page-section">
          <label for="home-page-description">Home Page Description</label>
          <textarea id="home-page-description" rows="4"></textarea>
          <button class="button" onclick="saveText('home-page-description', 'index-description.txt')">Update</button>
        </div>
  
        <div class="page-section">
          <label for="home-page-contactInfo">Home Page Contact Information</label>
          <textarea id="home-page-contactInfo" rows="4"></textarea>
          <button class="button" onclick="saveText('home-page-contactInfo', 'index-contact.txt')">Update</button>
        </div>
  
        <div class="page-section">
          <label for="home-page-services">Home Page Services</label>
          <textarea id="home-page-services" rows="4"></textarea>
          <button class="button" onclick="saveText('home-page-services', 'index-services.txt')">Update</button>
        </div>
  
        <div class="page-section">
          <label for="home-page-reviews">Home Page Reviews</label>
          <textarea id="home-page-reviews" rows="4"></textarea>
          <button class="button" onclick="saveText('home-page-reviews', 'index-reviews.txt')">Update</button>
        </div>
        
      </section>
    `,
    "services": `
      <section id="rectangle-24">
        <h1>Edit Services Page</h1>
        <div class="page-section">
          <label for="services-Chapter7">Chapter 7 Description</label>
          <textarea id="services-Chapter7" rows="4"></textarea>
          <button class="button" onclick="saveText('services-Chapter7', 'services-Chapter7.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="services-Chapter11">Chapter 11 Description</label>
          <textarea id="services-Chapter11" rows="4"></textarea>
          <button class="button" onclick="saveText('services-Chapter11', 'services-Chapter11.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="services-Chapter12">Chapter 12 Description</label>
          <textarea id="services-Chapter12" rows="4"></textarea>
          <button class="button" onclick="saveText('services-Chapter12', 'services-Chapter12.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="services-Chapter13">Chapter 13 Description</label>
          <textarea id="services-Chapter13" rows="4"></textarea>
          <button class="button" onclick="saveText('services-Chapter13', 'services-Chapter13.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="service-benefits">Service Benefits Description</label>
          <textarea id="service-benefits" rows="4"></textarea>
          <button class="button" onclick="saveText('service-benefits', 'service-benefits.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="why-choose-us">Why Choose Us Description</label>
          <textarea id="why-choose-us" rows="4"></textarea>
          <button class="button" onclick="saveText('why-choose-us', 'why-choose-us.txt')">Update</button>
        </div>
      </section>  
    `,
    "about-us": `
      <section id="rectangle-24">
        <h1>Edit About Us Page</h1>
         <div class="page-section">
          <label for="about-us">About Us Description</label>
          <textarea id="about-us" rows="4"></textarea>
          <button class="button" onclick="saveText('about-us', 'about-us.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-meet-eric">Meet Eric Description</label>
          <textarea id="about-meet-eric" rows="4"></textarea>
          <button class="button" onclick="saveText('about-meet-eric', 'about-meet-eric.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-erics-role">Eric's Role Description</label>
          <textarea id="about-erics-role" rows="4"></textarea>
          <button class="button" onclick="saveText('about-erics-role', 'about-erics-role.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-education">Education Description</label>
          <textarea id="about-education" rows="4"></textarea>
          <button class="button" onclick="saveText('about-education', 'about-education.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-client-commitment">Client Commitment Description</label>
          <textarea id="about-client-commitment" rows="4"></textarea>
          <button class="button" onclick="saveText('about-client-commitment', 'about-client-commitment.txt')">Update</button>
        </div>
      </section>
    `,
    "reviews": `
      <section id="rectangle-24">
        <h1>Edit Reviews Page</h1>
        <div class="page-section">
          <label for="reviews-header">Reviews Page Header</label>
          <textarea id="reviews-header" rows="2"></textarea>
          <button class="button" onclick="saveText('reviews-header', 'reviews-header.txt')">Update</button>
        </div>
        
        <div class="page-section">
          <label for="review1">Featured Review 1</label>
          <textarea id="review1" rows="4"></textarea>
          <button class="button" onclick="saveText('review1', 'review1.txt')">Update</button>
        </div>
        
        <div class="page-section">
          <label for="review2">Featured Review 2</label>
          <textarea id="review2" rows="4"></textarea>
          <button class="button" onclick="saveText('review2', 'review2.txt')">Update</button>
        </div>
        
        <div class="page-section">
          <label for="review3">Featured Review 3</label>
          <textarea id="review3" rows="4"></textarea>
          <button class="button" onclick="saveText('review3', 'review3.txt')">Update</button>
        </div>
      </section>
    `,
   "modify-users": `
      <section id="modify-users-section" class="rectangle-24">
        <h1>Add Users</h1>
        <div class="page-section">
          <form id="modify-user-form">
            <label for="modify-username">Username</label>
            <input type="text" id="modify-username" placeholder="Enter Username" required />
            <label for="modify-phone-number">Phone Number</label>
            <input type="phone-number" id="modify-phone-number" placeholder="Enter Phone Number" required />
            <label for="modify-email">Email</label>
            <input type="email" id="modify-email" placeholder="Enter Email" required />
            <label for="modify-password">Password</label>
            <input type="password" id="modify-password" placeholder="Enter Password" required />
            <label for="modify-password-verify">Confirm Password</label>
            <input type="password" id="modify-password-verify" placeholder="Re-enter Password" required />
            <label for="modify-role">Role</label>
            <select id="modify-role" required>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            </select>
            <button type="submit" class="button">Submit</button>
          </form>
        </div>
        <div class="page-section">
          <h2>Existing Users</h2>
          <table border="1" id="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="user-list"></tbody>
          </table>
        </div>
      </section>
    `
  };

  function showTime() {
    let time = new Date();
    let hour = time.getHours();
    let min = time.getMinutes();
    //let sec = time.getSeconds();  will not be using seconds for now
    let am_pm = "AM";

    if (hour >= 12) {
        am_pm = "PM";
        if (hour > 12) hour -= 12;
    } else if (hour == 0) {
        hour = 12;
    }

    min = min < 10 ? "0" + min : min;
    //sec = sec < 10 ? "0" + sec : sec;

    let currentTime = hour + ":" + min + " " + am_pm;

    let timeBox = document.querySelector(".time-box");
    if (timeBox) {
        timeBox.textContent = currentTime;
    } else {
        console.error("Error: .time-box element not found!");
    }

    let dateBox = document.querySelector(".date-box");
        if (dateBox) {
            let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let currentDate = time.toLocaleDateString("en-US", options);
            dateBox.textContent = currentDate;
        }
}

setInterval(showTime, 1000);
showTime();


  function updateContent(page) {
    if (pages[page]) {
      // Update the content
      contentSection.innerHTML = pages[page];
      
      // Load specific content based on the page
      if (page === "home") {
        loadText('home-page-title', 'index-title.txt');
        loadText('home-page-description', 'index-description.txt');
        loadText('home-page-contactInfo', 'index-contact.txt');
        loadText('home-page-services', 'index-services.txt');
        loadText('home-page-reviews', 'index-reviews.txt');
      } else if (page === "reviews") {
        loadText('reviews-header', 'reviews-header.txt');
        loadText('review1', 'review1.txt');
        loadText('review2', 'review2.txt');
        loadText('review3', 'review3.txt');
      } else if (page === "services") {
        loadText('services-Chapter7', 'services-Chapter7.txt');
        loadText('services-Chapter11', 'services-Chapter11.txt');
        loadText('services-Chapter12', 'services-Chapter12.txt');
        loadText('services-Chapter13', 'services-Chapter13.txt');
        loadText('services-benefits', 'services-benefits.txt');
        loadText('why-choose-us', 'why-choose-us.txt');
      } else if (page === "about-us") {
        loadText('about-us', 'about-us.txt');
        loadText('about-meet-eric', 'about-meet-eric.txt');
        loadText('about-erics-role', 'about-erics-role.txt');
        loadText('about-education', 'about-education.txt');
        loadText('about-client-commitment', 'about-client-commitment.txt');
      }

      // Update navigation active state
      navLinks.forEach(link => link.classList.remove("active"));
      const activeLink = document.getElementById(`${page}-link`);
      if (activeLink) {
        activeLink.classList.add("active");
      }

      // Save the last visited page
      localStorage.setItem("lastVisitedPage", page);
    }
  }

  // Attach click events to navigation links
  navLinks.forEach(link => {
    link.addEventListener("click", function (event) {
      const page = this.id.replace("-link", ""); // Extract page name

      // Allow external links (like Database) to open
      if (page === "database") {
        return; // Don't prevent the default action
      }

      event.preventDefault();  // Prevents anchor jump for internal pages
      updateContent(page);
    });
  });

  // Load the last visited page from localStorage or default to home
  const lastVisitedPage = localStorage.getItem("lastVisitedPage") || "home";
  updateContent(lastVisitedPage);
});
/*
function addUser(username, email, password) {
  var params = {
    UserPoolId: "us-east-2_WXPh0LHEc",  // Your User Pool ID
    Username: username,
    TemporaryPassword: password,         // This is a temporary password that the user must change
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "email_verified", Value: "true" }
    ],
    MessageAction: "SUPPRESS"            // Do not send the automatic invitation email
  };
  cognitoISP.adminCreateUser(params, function(err, data) {
    if (err) {
      console.error("Error creating user:", err);
      alert("Error creating user: " + err.message);
    } else {
      console.log("User created successfully:", data);
      alert("User created successfully!");
      loadUsers();  // Refresh the user list
    }
  });
}
*/

