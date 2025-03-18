document.addEventListener("DOMContentLoaded", function () {
  const contentSection = document.getElementById("dynamic-content");
  const navLinks = document.querySelectorAll("nav a");


  // Check if the dynamic content section exists
  if (!contentSection) {
    console.error("Error: #dynamic-content section not found!");
    return;
  }

  // Define content for each section now updated JSON files
  const pages = {
    "home": `
      <section id="rectangle-24">
        <h1>Edit Home Page</h1>
  
        <div class="page-section">
          <label for="home-page-title">Title</label>
          <textarea id="home-page-title" rows="1"></textarea>
          <button class="button" onclick="saveText('home-page-title', 'index-title.json')">Update</button>
        </div>
  
        <div class="page-section">
          <label for="home-page-description">Main Description</label>
          <textarea id="home-page-description" rows="4"></textarea>
          <button class="button" onclick="saveText('home-page-description', 'index-description.json')">Update</button>
        </div>
  
        <div class="page-section">
          <label for="home-page-contactInfo">Contact Information</label>
          <textarea id="home-page-contactInfo" rows="4"></textarea>
          <button class="button" onclick="saveText('home-page-contactInfo', 'index-contact.json')">Update</button>
        </div>
        
        <div class="page-section">
          <label for="home-page-services-selection">Select Service Description</label>
          <select id="home-page-services-selection">
            <option value="Chapter7">Chapter 7 Description</option>
            <option value="Chapter11">Chapter 11 Description</option>
            <option value="Chapter12">Chapter 12 Description</option>
            <option value="Chapter13">Chapter 13 Description</option>
          </select>
          <textarea id="home-page-services" rows="4"></textarea>
          <button id="update-services-button" class="button" onclick="saveText('home-page-services', 'index-services.json')">Update</button>
        </div>
        <div class="page-section">
  <label for="image">If you want to change the banner image at the top of the home page, select it below:</label>
  <input type="file" name="banner-index.jpg" id="image" accept="image/*" required>
  <br>
  <button type="submit" class="button" id="upload-btn">Upload</button>
  <p id="upload-status"></p> <!-- Status message for upload -->
</div>

<script>
  function uploadImage(event) {
    event.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById("image");
    const statusMessage = document.getElementById("upload-status");
    if (fileInput.files.length === 0) {
      statusMessage.innerText = "⚠️ Please select an image file.";
      statusMessage.style.color = "red";
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    document.getElementById("upload-btn").innerText = "Uploading...";

    fetch("/upload", {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById("upload-btn").innerText = "Upload";
      if (data.success) {
        statusMessage.innerText = "✅ Image uploaded successfully!";
        statusMessage.style.color = "green";
      } else {
        statusMessage.innerText = "❌ Upload failed: " + data.message;
        statusMessage.style.color = "red";
      }
    })
    .catch(error => {
      document.getElementById("upload-btn").innerText = "Upload";
      statusMessage.innerText = "❌ An error occurred while uploading.";
      statusMessage.style.color = "red";
      console.error("Error uploading image:", error);
    });
  }

  document.getElementById("upload-btn").addEventListener("click", uploadImage);
</script>

        
      </section>
    `,
    "services": `
      <section id="rectangle-24">
        <h1>Edit Services Page</h1>
        <div class="page-section">
          <label for="services-Chapter7">Chapter 7</label>
          <textarea id="services-Chapter7" rows="4"></textarea>
          <button class="button" onclick="saveText('services-Chapter7', 'services-Chapter7.json')">Update</button>
        </div>
        <div class="page-section">
          <label for="services-Chapter11">Chapter 11</label>
          <textarea id="services-Chapter11" rows="4"></textarea>
          <button class="button" onclick="saveText('services-Chapter11', 'services-Chapter11.json')">Update</button>
        </div>
        <div class="page-section">
          <label for="services-Chapter12">Chapter 12</label>
          <textarea id="services-Chapter12" rows="4"></textarea>
          <button class="button" onclick="saveText('services-Chapter12', 'services-Chapter12.json')">Update</button>
        </div>
        <div class="page-section">
          <label for="services-Chapter13">Chapter 13</label>
          <textarea id="services-Chapter13" rows="4"></textarea>
          <button class="button" onclick="saveText('services-Chapter13', 'services-Chapter13.json')">Update</button>
        </div>
        <div class="page-section">
          <label for="service-benefits">Benefits Description</label>
          <textarea id="service-benefits" rows="4"></textarea>
          <button class="button" onclick="saveText('service-benefits', 'service-benefits.json')">Update</button>
        </div>
        <div class="page-section">
          <label for="why-choose-us">Why Choose Us</label>
          <textarea id="why-choose-us" rows="4"></textarea>
          <button class="button" onclick="saveText('why-choose-us', 'why-choose-us.json')">Update</button>
        </div>
        <div class="page-section">
  <label for="image">If you want to change the banner image at the top of the Services page, select it below:</label>
  <input type="file" name="banner-index.jpg" id="image" accept="image/*" required>
  <br>
  <button type="submit" class="button" id="upload-btn">Upload</button>
  <p id="upload-status"></p> <!-- Status message for upload -->
</div>

<script>
  function uploadImage(event) {
    event.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById("image");
    const statusMessage = document.getElementById("upload-status");
    if (fileInput.files.length === 0) {
      statusMessage.innerText = "⚠️ Please select an image file.";
      statusMessage.style.color = "red";
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    document.getElementById("upload-btn").innerText = "Uploading...";

    fetch("/upload", {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById("upload-btn").innerText = "Upload";
      if (data.success) {
        statusMessage.innerText = "✅ Image uploaded successfully!";
        statusMessage.style.color = "green";
      } else {
        statusMessage.innerText = "❌ Upload failed: " + data.message;
        statusMessage.style.color = "red";
      }
    })
    .catch(error => {
      document.getElementById("upload-btn").innerText = "Upload";
      statusMessage.innerText = "❌ An error occurred while uploading.";
      statusMessage.style.color = "red";
      console.error("Error uploading image:", error);
    });
  }

  document.getElementById("upload-btn").addEventListener("click", uploadImage);
</script>

      </section>  
    `,
    "about-us": `
      <section id="rectangle-24">
        <h1>Edit About Us Page</h1>
         <div class="page-section">
          <label for="about-us">About Us</label>
          <textarea id="about-us" rows="4"></textarea>
          <button class="button" onclick="saveText('about-us', 'about-us.json')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-meet-eric">Meet Eric</label>
          <textarea id="about-meet-eric" rows="4"></textarea>
          <button class="button" onclick="saveText('about-meet-eric', 'about-meet-eric.json')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-erics-role">Eric's Role</label>
          <textarea id="about-erics-role" rows="4"></textarea>
          <button class="button" onclick="saveText('about-erics-role', 'about-erics-role.json')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-education">Education</label>
          <textarea id="about-education" rows="4"></textarea>
          <button class="button" onclick="saveText('about-education', 'about-education.json')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-client-commitment">Client Commitment</label>
          <textarea id="about-client-commitment" rows="4"></textarea>
          <button class="button" onclick="saveText('about-client-commitment', 'about-client-commitment.json')">Update</button>
        </div>
        <div class="page-section">
  <label for="image">If you want to change the banner image at the top of the About Us page, select it below:</label>
  <input type="file" name="banner-index.jpg" id="image" accept="image/*" required>
  <br>
  <button type="submit" class="button" id="upload-btn">Upload</button>
  <p id="upload-status"></p> <!-- Status message for upload -->
</div>

<script>
  function uploadImage(event) {
    event.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById("image");
    const statusMessage = document.getElementById("upload-status");
    if (fileInput.files.length === 0) {
      statusMessage.innerText = "⚠️ Please select an image file.";
      statusMessage.style.color = "red";
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    document.getElementById("upload-btn").innerText = "Uploading...";

    fetch("/upload", {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById("upload-btn").innerText = "Upload";
      if (data.success) {
        statusMessage.innerText = "✅ Image uploaded successfully!";
        statusMessage.style.color = "green";
      } else {
        statusMessage.innerText = "❌ Upload failed: " + data.message;
        statusMessage.style.color = "red";
      }
    })
    .catch(error => {
      document.getElementById("upload-btn").innerText = "Upload";
      statusMessage.innerText = "❌ An error occurred while uploading.";
      statusMessage.style.color = "red";
      console.error("Error uploading image:", error);
    });
  }

  document.getElementById("upload-btn").addEventListener("click", uploadImage);
</script>

        
      </section>
    `,
    "reviews": `
      <section id="rectangle-24">

        <div class="platform-tabs">
          <button class="tab-button active" onclick="showReviewTab('google')">Google Reviews</button>
          <button class="tab-button" onclick="showReviewTab('yelp')">Yelp Reviews</button>
        </div>
        
        <div id="google-reviews-tab" class="review-tab active">
          <h2>Google Reviews</h2>
          <div class="reviews-grid" id="google-reviews-grid">
            <div class="loading">Loading reviews...</div>
          </div>
        </div>
        
        <div id="yelp-reviews-tab" class="review-tab">
          <h2>Yelp Reviews</h2>
          <div class="reviews-grid" id="yelp-reviews-grid">
            <div class="loading">Loading reviews...</div>
          </div>
        </div>
        <div class="page-section">
  <label for="image">If you want to change the banner image at the top of the Reviews page, select it below:</label>
  <input type="file" name="banner-index.jpg" id="image" accept="image/*" required>
  <br>
  <button type="submit" class="button" id="upload-btn">Upload</button>
  <p id="upload-status"></p> <!-- Status message for upload -->
</div>

<script>
  function uploadImage(event) {
    event.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById("image");
    const statusMessage = document.getElementById("upload-status");
    if (fileInput.files.length === 0) {
      statusMessage.innerText = "⚠️ Please select an image file.";
      statusMessage.style.color = "red";
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    document.getElementById("upload-btn").innerText = "Uploading...";

    fetch("/upload", {
      method: "POST",
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById("upload-btn").innerText = "Upload";
      if (data.success) {
        statusMessage.innerText = "✅ Image uploaded successfully!";
        statusMessage.style.color = "green";
      } else {
        statusMessage.innerText = "❌ Upload failed: " + data.message;
        statusMessage.style.color = "red";
      }
    })
    .catch(error => {
      document.getElementById("upload-btn").innerText = "Upload";
      statusMessage.innerText = "❌ An error occurred while uploading.";
      statusMessage.style.color = "red";
      console.error("Error uploading image:", error);
    });
  }

  document.getElementById("upload-btn").addEventListener("click", uploadImage);
</script>

        
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
        loadText('home-page-title', 'index-title.json');
        loadText('home-page-description', 'index-description.json');
        loadText('home-page-contactInfo', 'index-contact.json');
        loadText('home-page-services', 'index-services.json');
        loadText('home-page-reviews', 'index-reviews.json');
      } else if (page === "reviews") {
        // Initialize the reviews management interface
        initReviewsManagement();
      } else if (page === "services") {
        loadText('services-Chapter7', 'services-Chapter7.json');
        loadText('services-Chapter11', 'services-Chapter11.json');
        loadText('services-Chapter12', 'services-Chapter12.json');
        loadText('services-Chapter13', 'services-Chapter13.json');
        loadText('service-benefits', 'service-benefits.json');
        loadText('why-choose-us', 'why-choose-us.json');
      } else if (page === "about-us") {
        loadText('about-us', 'about-us.json');
        loadText('about-meet-eric', 'about-meet-eric.json');
        loadText('about-erics-role', 'about-erics-role.json');
        loadText('about-education', 'about-education.json');
        loadText('about-client-commitment', 'about-client-commitment.json');
      } else if (page === "modify-users") {
        // Example: Call loadUsers on page load or when needed
        document.addEventListener("DOMContentLoaded", loadUsers);
        const userForm = document.getElementById('modify-user-form');
        if (userForm) {
          userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addUser();
          });
        } else {
          console.error("modify-user-form not found.");
        }
        loadUsers();
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

  const token = localStorage.getItem("id_token");

  if (token) {
    try {
      // Decode the token payload
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Extract the username from the token
      const username = payload["cognito:username"] || payload["username"] || "User";

      // Update the greeting in the profile container (replace "Hello, Eric!" with the actual username)
      const greetingElement = document.querySelector(".profile-container h2");
      if (greetingElement) {
        greetingElement.textContent = `Hello, ${username}!`;
      }

      // Hide links if the user is not an Admin
      const groups = payload["cognito:groups"] || [];
      if (!groups.includes("Admin")) {
        document.getElementById("modify-users-link").style.display = "none";
        document.getElementById("database-link").style.display = "none";
      }
    } catch (error) {
      console.error("❌ Error decoding token:", error);
    }
  } else {
    console.warn("⚠️ No ID token found in localStorage.");
  }


});

// Function to initialize reviews management
function initReviewsManagement() {
  if (typeof loadGoogleReviewsAdmin === 'function') {
    loadGoogleReviewsAdmin();
    loadYelpReviewsAdmin();
  } else {
    console.error('Reviews management functions not loaded');
  }
}

async function addUser() {
  // Get the values from form inputs
  const username = document.getElementById('modify-username').value.trim();
  const phone = document.getElementById('modify-phone-number').value.trim();
  const email = document.getElementById('modify-email').value.trim();
  const password = document.getElementById('modify-password').value;
  const confirmPassword = document.getElementById('modify-password-verify').value;
  const role = document.getElementById('modify-role').value; // Ensure role is included

  // Validate required fields before sending
  if (!username || !phone || !email || !password || !confirmPassword || !role) {
    alert("Error: All fields are required.");
    return;
  }

  // Build the payload
  const payload = {
    username,
    phone,
    email,
    password,
    confirmPassword,
    role // Ensure role is included
  };

  console.log("Payload being sent:", payload); // Debugging output

  const token = localStorage.getItem("id_token"); // Get token from local storage
  if (!token) {
    alert("You are not authenticated. Please log in again.");
    window.location.href = "/admin-login"; // Redirect if no token
  }

  const apiEndpoint = 'https://u1top45us9.execute-api.us-east-2.amazonaws.com/user';

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log("Raw API response:", text);
    const data = JSON.parse(text);

    if (response.ok) {
      console.log('User created successfully!');
      alert("User added successfully!");
      loadUsers(); // Refresh the user list
    } else {
      alert('Error: ' + (data.error || 'Unknown error'));
      console.error('API error:', data);
    }
  } catch (error) {
    console.error('Error calling API:', error);
    alert('An error occurred while creating the user.');
  }
}


async function deleteUser(email, role) {
  if (!confirm(`Are you sure you want to delete user "${email}"?`)) return;

  const token = localStorage.getItem("id_token"); // Get stored token
  if (!token) {
    alert("You are not authenticated. Please log in again.");
    window.location.href = "/admin-login"; // Redirect if no token
    return;
  }

  const apiEndpoint = 'https://u1top45us9.execute-api.us-east-2.amazonaws.com/Test/user';

  try {
    // Ensure JSON format is correct 
    const payload = { email, role };
    console.log("🚀 Sending payload:", JSON.stringify(payload));

    const response = await fetch(apiEndpoint, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload) // Ensure valid JSON formatting 
    });

    const text = await response.text();
    console.log("🔍 Raw API response:", text);

    try {
      const data = JSON.parse(text);
      if (response.ok) {
        console.log('User deleted successfully!');
        alert("User deleted successfully!");
        loadUsers(); // Refresh user list
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
        console.error('API error:', data);
      }
    } catch (error) {
      console.error('Error parsing response:', text);
      alert('An error occurred while deleting the user.');
    }
  } catch (error) {
    console.error('Error calling API:', error);
    alert('An error occurred while deleting the user.');
  }
}






async function loadUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    if (data.success) {
      console.log("Users loaded:", data.users);

      const userList = document.getElementById("user-list");
      userList.innerHTML = "";

      data.users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.username || 'N/A'}</td>
          <td>${user.email || 'N/A'}</td>
          <td>${user.role || 'N/A'}</td>
          <td><button onclick="deleteUser('${user.email}', '${user.role}')">Delete</button></td>
        `;
        userList.appendChild(row);
      });
    } else {
      console.error("Error loading users:", data.error);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initMobNab();
});

async function initMobNab() {
  const menuToggle = document.getElementById("menuToggleAdmin");
  const navBar = document.querySelector(".sidebar");

  if (menuToggle && navBar) {
    menuToggle.addEventListener("click", function () {
      navBar.classList.toggle("active");
      console.log("button is being clicked");
    });
  } else {
    console.error("Menu Toggle or NavBar not found!");
  }
}

const sidebarLinks = document.querySelectorAll('.sidebar a');
const sidebar = document.querySelector('.sidebar');


sidebarLinks.forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('active'); 
  });
});
