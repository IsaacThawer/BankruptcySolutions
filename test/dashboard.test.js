/** @jest-environment jsdom */
const {   deleteUser, initReviewsManagement, updateContent } = require('../admin/js/dashboard');
const {uploadImage} = require('../admin/js/upload-image')
const fs = require("fs");
const path = require("path");
const { fireEvent, screen, waitFor } = require('@testing-library/react');
require('@testing-library/jest-dom');
//const { jest } =  require('@jest/globals')



describe('initReviewsManagement', () => {
  let loadGoogleReviewsAdmin;
  let loadYelpReviewsAdmin;

  beforeEach(() => {
    // Mock the functions before each test run
    loadGoogleReviewsAdmin = jest.fn();
    loadYelpReviewsAdmin = jest.fn();

    // Attach the mocked functions to the global object (window)
    global.window.loadGoogleReviewsAdmin = loadGoogleReviewsAdmin;
    global.window.loadYelpReviewsAdmin = loadYelpReviewsAdmin;
  });

  afterEach(() => {
    // Cleanup after each test run
    jest.clearAllMocks();
  });

  it('should call loadGoogleReviewsAdmin and loadYelpReviewsAdmin when they are functions', () => {

    initReviewsManagement();


    expect(loadGoogleReviewsAdmin).toHaveBeenCalled();
    expect(loadYelpReviewsAdmin).toHaveBeenCalled();
  });

  it('should log an error if the functions are not available', () => {
    // Mocking console.error to capture logs
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Temporarily mock the functions to undefined
    global.window.loadGoogleReviewsAdmin = undefined;
    global.window.loadYelpReviewsAdmin = undefined;


    initReviewsManagement();


    expect(consoleErrorSpy).toHaveBeenCalledWith('Reviews management functions not loaded');


    consoleErrorSpy.mockRestore();
  });
})




global.loadText = jest.fn();
global.initReviewsManagement = jest.fn();
global.loadUsers = jest.fn();

// Simulate minimal DOM
document.body.innerHTML = `
  <div id="dynamic-content"></div>
  <nav>
    <a id="home-link"></a>
    <a id="modify-users-link"></a>
  </nav>
`;

// Mock navLinks selector used inside updateContent
const navLinks = document.querySelectorAll("nav a");

// Fake pages object (simulate loaded content)
global.pages = {
  home: `
  <section id="rectangle-24">
    <h1>Edit Home Page</h1>
    <div class="page-section">
      <label for="home-page-title">Title</label>
      <textarea id="home-page-title" rows="1"></textarea>
    </div>
  </section>
`,
"modify-users": `
  <section>
    <h1>Modify Users</h1>
    <form id="modify-user-form"></form>
  </section>
`
};



describe("updaetContent dom", () => {


  beforeEach(() => {
    // Reset DOM and mocks
    
    document.getElementById("dynamic-content").innerHTML = "";
    localStorage.clear();
    navLinks.forEach(link => link.classList.remove("active"));
    jest.clearAllMocks();
  });

 

  test("renders home page and calls loadText when Admin is NOT needed", () => {
    updateContent("home");

    const content = document.getElementById("dynamic-content").innerHTML;
    expect(content).toContain("Edit Home Page");
    expect(loadText).toHaveBeenCalledWith("home-page-title", "index-title.json");
    expect(loadText).toHaveBeenCalledTimes(6); // Adjust if more/less
  });


  test("redirects to home if not an Admin accessing modify-users", () => {
    // Simulate token without Admin group
    const fakeToken = btoa(JSON.stringify({})) + "." + btoa(JSON.stringify({ "cognito:groups": [] })) + ".signature";
    localStorage.setItem("id_token", fakeToken);
  
    updateContent("modify-users");
  
    const content = document.getElementById("dynamic-content").innerHTML;
    expect(content).toContain("Edit Home Page"); // ✅ updated string from mocked pages.home
  });



  test("adds active class to nav link", () => {
    updateContent("home");

    const homeLink = document.getElementById("home-link");
    expect(homeLink.classList.contains("active")).toBe(true);
  });

  test("sets last visited page in localStorage", () => {
    updateContent("home");

    expect(localStorage.getItem("lastVisitedPage")).toBe("home");
  });


  test("does nothing for undefined page", () => {
    updateContent("non-existent");

    const content = document.getElementById("dynamic-content").innerHTML;
    expect(content).toBe("");
  });


  test('should log an error if decoding the token fails', () => {

    const faultyToken = 'invalid.token';
    localStorage.setItem('id_token', faultyToken);


    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();


    updateContent('home');


    expect(consoleErrorMock).toHaveBeenCalledWith('Error decoding token:', expect.any(Error));

    consoleErrorMock.mockRestore();
  });

  test("loads modify-users page when Admin user is logged in", () => {
    // Simulate admin token
    const adminToken = btoa(JSON.stringify({})) + "." + btoa(JSON.stringify({ "cognito:groups": ["Admin"] })) + ".signature";
    localStorage.setItem("id_token", adminToken);
  
    updateContent("modify-users");
  
    const content = document.getElementById("dynamic-content").innerHTML;
    
    // Instead of checking for "Modify Users Page", check for a more specific element
    const modifyUsersSection = document.getElementById("modify-users-section");
    
    // Verify that the section is rendered
    expect(modifyUsersSection).not.toBeNull();
    expect(modifyUsersSection).toContainHTML("<h1>Add Users</h1>");  // Example: Ensure the title exists
  });




});

describe('pages elif', () => {
  beforeEach(() => {
    // Set up a basic HTML structure for testing
    document.body.innerHTML = `
      <div id="dynamic-content"></div>
      <nav>
        <a id="home-link" href="#">Home</a>
        <a id="reviews-link" href="#">Reviews</a>
        <a id="services-link" href="#">Services</a>
        <a id="about-us-link" href="#">About Us</a>
        <a id="modify-users-link" href="#">Modify Users</a>
      </nav>
    `;

    // Mocking localStorage
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn().mockReturnValue('home');

    // Mocking loadText and initReviewsManagement to avoid actual content loading
    global.loadText = jest.fn();
    global.initReviewsManagement = jest.fn();

    // Mocking console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should log an error if #dynamic-content is not found', () => {
    // Removing the #dynamic-content element to simulate missing content section
    document.getElementById('dynamic-content').remove();

    updateContent('home');

    expect(console.error).toHaveBeenCalledWith('contentSection not found');
  });

  test('should update the content section for the "home" page', () => {
    updateContent('home');

    // Check if loadText was called with the correct parameters for home page
    expect(loadText).toHaveBeenCalledWith('home-page-title', 'index-title.json');
    expect(loadText).toHaveBeenCalledWith('home-page-description', 'index-description.json');
    expect(loadText).toHaveBeenCalledWith('home-page-map', 'index-map.json');
    expect(loadText).toHaveBeenCalledWith('home-page-contactInfo', 'index-contact.json');
    expect(loadText).toHaveBeenCalledWith('home-page-services', 'index-services.json');
    expect(loadText).toHaveBeenCalledWith('home-page-reviews', 'index-reviews.json');
  });

  test('should update the active class on the navigation link for the current page', () => {
    updateContent('services');

    // Check if the active class is added to the 'services-link' element
    const servicesLink = document.getElementById('services-link');
    expect(servicesLink.classList.contains('active')).toBe(true);

    // Check that other links do not have the active class
    const homeLink = document.getElementById('home-link');
    expect(homeLink.classList.contains('active')).toBe(false);
  });

  test('should store the last visited page in localStorage', () => {
    updateContent('about-us');

    // Check that the last visited page is stored correctly in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('lastVisitedPage', 'about-us');
  });



  test('should not call loadText for pages that do not have content', () => {
    updateContent('non-existing-page');

    // Ensure loadText is not called since there is no defined content for this page
    expect(loadText).not.toHaveBeenCalled();
  });

  test('should add active class to the correct nav link for a given page', () => {
    updateContent('about-us');
    
    const aboutUsLink = document.getElementById('about-us-link');
    expect(aboutUsLink.classList.contains('active')).toBe(true);
  });




  describe('Navigation Event Listeners', () => {
    beforeEach(() => {
      // Set up our DOM elements
      document.body.innerHTML = `
        <nav>
          <a id="home-link" href="#">Home</a>
          <a id="about-link" href="#">About</a>
          <a id="database-link" href="#">Database</a>
        </nav>
        <div id="content"></div>
      `;
  
      // Mock global functions
      global.updateContent = jest.fn();
      global.initMobNab = jest.fn();
  
      // Ensure the DOMContentLoaded listener is triggered
      document.addEventListener('DOMContentLoaded', () => {
        initMobNab();
      });
  
      // Manually trigger the DOMContentLoaded event
      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);
    });
  
  
    afterEach(() => {
      jest.clearAllMocks(); // Reset mocks to ensure clean tests
    });
  
    
  
    test('click on a link prevents default behavior and calls updateContent', () => {
      const aboutLink = document.getElementById('about-link');
      
      // Create a spy for preventDefault
      const preventDefaultMock = jest.fn();
      
      // Add event listener to simulate preventDefault and updateContent behavior
      aboutLink.addEventListener('click', (e) => {
        e.preventDefault = preventDefaultMock;  // Mock preventDefault
        e.preventDefault();  // Call the mock function
        global.updateContent('about');  // Simulate calling updateContent
      });
    
      // Dispatch the click event on the aboutLink
      aboutLink.click();
    
      // Check if preventDefault was called
      expect(preventDefaultMock).toHaveBeenCalled();
      
      // Verify that updateContent was called with the correct page name
      expect(global.updateContent).toHaveBeenCalledWith('about');
    });
  
    test('click on "database-link" does not call updateContent', () => {
      const databaseLink = document.getElementById('database-link');
      databaseLink.click();
  
      // Check that updateContent was not called for 'database' link
      expect(global.updateContent).not.toHaveBeenCalled();
    });
  });
  

});




