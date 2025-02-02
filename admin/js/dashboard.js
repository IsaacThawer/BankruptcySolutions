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
    `
  };

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
        loadText('services-description', 'services-description.txt');
      } else if (page === "about-us") {
        loadText('about-us-description', 'about-us-description.txt');
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