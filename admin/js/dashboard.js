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
          <label for="services-description">Services Description</label>
          <textarea id="services-description" rows="4"></textarea>
          <button class="button" onclick="saveText('services-description', 'services-description.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="services-description">Services Description</label>
          <textarea id="services-description" rows="4"></textarea>
          <button class="button" onclick="saveText('services-description', 'services-description.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="services-description">Services Description</label>
          <textarea id="services-description" rows="4"></textarea>
          <button class="button" onclick="saveText('services-description', 'services-description.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="services-description">Services Description</label>
          <textarea id="services-description" rows="4"></textarea>
          <button class="button" onclick="saveText('services-description', 'services-description.txt')">Update</button>
        </div>
      </section>  
    `,
    "about-us": `
      <section id="rectangle-24">
        <h1>Edit About Us Page</h1>
        <div class="page-section">
          <label for="about-us-description">About Us Description</label>
          <textarea id="about-us-description" rows="4"></textarea>
          <button class="button" onclick="saveText('about-us-description', 'about-us-description.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-us-description">About Us Description</label>
          <textarea id="about-us-description" rows="4"></textarea>
          <button class="button" onclick="saveText('about-us-description', 'about-us-description.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-us-description">About Us Description</label>
          <textarea id="about-us-description" rows="4"></textarea>
          <button class="button" onclick="saveText('about-us-description', 'about-us-description.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-us-description">About Us Description</label>
          <textarea id="about-us-description" rows="4"></textarea>
          <button class="button" onclick="saveText('about-us-description', 'about-us-description.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="about-us-description">About Us Description</label>
          <textarea id="about-us-description" rows="4"></textarea>
          <button class="button" onclick="saveText('about-us-description', 'about-us-description.txt')">Update</button>
        </div>
      </section>
    `,
    "reviews": `
      <section id="rectangle-24">
        <h1>Edit Reviews Page</h1>
        <div class="page-section">
          <label for="reviews-section">Customer Reviews</label>
          <textarea id="reviews-section" rows="4"></textarea>
          <button class="button" onclick="saveText('reviews-section', 'reviews.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="reviews-section">Customer Reviews</label>
          <textarea id="reviews-section" rows="4"></textarea>
          <button class="button" onclick="saveText('reviews-section', 'reviews.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="reviews-section">Customer Reviews</label>
          <textarea id="reviews-section" rows="4"></textarea>
          <button class="button" onclick="saveText('reviews-section', 'reviews.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="reviews-section">Customer Reviews</label>
          <textarea id="reviews-section" rows="4"></textarea>
          <button class="button" onclick="saveText('reviews-section', 'reviews.txt')">Update</button>
        </div>
        <div class="page-section">
          <label for="reviews-section">Customer Reviews</label>
          <textarea id="reviews-section" rows="4"></textarea>
          <button class="button" onclick="saveText('reviews-section', 'reviews.txt')">Update</button>
        </div>
      </section>
    `
  };

  function updateContent(page) {
    if (pages[page]) {
      contentSection.innerHTML = pages[page]; // Update content instead of removing #dynamic-content

      // Remove 'active' class from all sidebar buttons
      navLinks.forEach(link => link.classList.remove("active"));

      // Add 'active' class to the clicked button
      const activeLink = document.getElementById(`${page}-link`);
      if (activeLink) {
        activeLink.classList.add("active");
      }

      localStorage.setItem("lastVisitedPage", page); // Save the last visited page
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

  // Load the home page by default
  //updateContent("home");

  // Load the last visited page from localStorage instead of always defaulting to home
  const lastVisitedPage = localStorage.getItem("lastVisitedPage") || "home";
  updateContent(lastVisitedPage);
});