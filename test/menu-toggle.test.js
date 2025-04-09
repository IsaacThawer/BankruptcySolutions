const { initPublicNav } = require('../public/js/menu-toggle');

describe('initPublicNav', () => {
  let menuToggle;
  let navbar;

  // Set up the document structure
  beforeEach(() => {
    // Set up a minimal DOM for target elements only
    document.body.innerHTML = `
      <button id="menuToggle">Toggle Menu</button>
      <div id="navbar" class=""></div>
    `;
    document.dispatchEvent(new Event("DOMContentLoaded"));


    // Initialize event listeners 
    initPublicNav();

    // Get references to the DOM elements
    menuToggle = document.getElementById('menuToggle');
    navbar = document.getElementById('navbar');
    document.dispatchEvent(new Event("DOMContentLoaded"));

  });

  it('should add "active" class to navbar when menuToggle is clicked', () => {
    // Verify that the navbar initially does NOT have the "active" class
    expect(navbar.classList.contains('active')).toBe(false);

    // Simulate a click event on the menuToggle button
    menuToggle.click();

    // Check that the "active" class has been added to the navbar
    expect(navbar.classList.contains('active')).toBe(true);
  });

  it('should remove "active" class from navbar when menuToggle is clicked twice', () => {
    // Click once to add the "active" class
    menuToggle.click();
    expect(navbar.classList.contains('active')).toBe(true);

    // Click again to remove the "active" class
    menuToggle.click();
    expect(navbar.classList.contains('active')).toBe(false);
  });
});
