/**
 * @jest-environment jsdom
 */

// npm install selenium-webdriver chrome-driver jest
// Import necessary modules from Selenium WebDriver
const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Set a longer timeout for the entire test suite
jest.setTimeout(60000);

describe('Admin Panel Navigation Tests', () => {
  let driver;
  const baseUrl = 'http://localhost:8000/admin/login.html';
  // Admin credentials - replace with valid test credentials
  const adminUsername = 'Test';
  const adminPassword = 'Test1234$';
  
  // List of admin panel sections to test
  const sections = [
    { id: 'home-link', title: 'Edit Home Page' },
    { id: 'services-link', title: 'Edit Services Page' },
    { id: 'about-us-link', title: 'Edit About Us Page' },
    { id: 'reviews-link', title: 'Google Reviews' }, // Looking for a header in the Reviews section
    { id: 'modify-users-link', title: 'Add Users' }
  ];

  beforeAll(async () => {
    // Set up Chrome options
    const options = new chrome.Options();
    // Uncomment the line below if you want to run headless
    // options.addArguments('--headless');
    
    // Initialize the WebDriver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Login to the admin panel
    await driver.get(baseUrl);
    
    // Find username and password fields and enter credentials
    const usernameField = await driver.findElement(By.id('username'));
    const passwordField = await driver.findElement(By.id('password'));
    
    await usernameField.sendKeys(adminUsername);
    await passwordField.sendKeys(adminPassword);
    
    // Click the submit button
    const submitButton = await driver.findElement(By.css('.login-button-group button.login-button'));
    await submitButton.click();
    
    // Wait for redirection to dashboard
    await driver.wait(until.urlContains('dashboard.html'), 10000);
  });

  afterAll(async () => {
    // Clean up by closing the browser
    if (driver) {
      await driver.quit();
    }
  });

  // Test 1: Verify the admin panel loads correctly after login
  test('Admin panel loads correctly after login', async () => {
    // Verify we are on the dashboard page
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('dashboard.html');
    
    // Check that the profile greeting is visible
    const greeting = await driver.findElement(By.css('.profile-container h2'));
    const greetingText = await greeting.getText();
    expect(greetingText).toContain('Hello');
    
    // Check that navigation sidebar is visible
    const sidebar = await driver.findElement(By.css('.sidebar'));
    const isDisplayed = await sidebar.isDisplayed();
    expect(isDisplayed).toBe(true);
    
    // Check that the dynamic content section is visible
    const dynamicContent = await driver.findElement(By.id('dynamic-content'));
    const contentDisplayed = await dynamicContent.isDisplayed();
    expect(contentDisplayed).toBe(true);
  });

  // Test 2: Check all navigation links are present
  test('All navigation links are present in the sidebar', async () => {
    // Get all navigation links
    const navLinks = await driver.findElements(By.css('.sidebar nav a'));
    
    // Verify the number of links matches expected sections
    expect(navLinks.length).toBeGreaterThanOrEqual(sections.length);
    
    // Verify each section link is present by ID
    for (const section of sections) {
      const link = await driver.findElement(By.id(section.id));
      expect(link).toBeDefined();
    }
  });

  // Test 3: Navigate to each section and verify content loads correctly using JavaScript execution
  test('Each section loads correct content when clicked', async () => {
    // Check each section link navigation
    for (const section of sections) {
      try {
        // Find the link element
        const link = await driver.findElement(By.id(section.id));
        
        // Scroll the element into view
        await driver.executeScript("arguments[0].scrollIntoView(true);", link);
        await driver.sleep(500); // Give time for scrolling
        
        // Use JavaScript to click the element (more reliable than direct click)
        await driver.executeScript("arguments[0].click();", link);
        
        // Wait for section content to load
        await driver.sleep(1500);
        
        // Check if the expected content for this section is present
        const dynamicContent = await driver.findElement(By.id('dynamic-content'));
        const contentHtml = await dynamicContent.getAttribute('innerHTML');
        
        // Verify the section title is present in the content
        expect(contentHtml).toContain(section.title);
      } catch (error) {
        console.error(`Error navigating to section ${section.id}: ${error.message}`);
        throw error;
      }
    }
  });

  // Test 4: Verify that "Database" link goes to the client submissions page
  test('Database link navigates to the client submissions page', async () => {
    // Find the Database link
    const databaseLink = await driver.findElement(By.id('database-link'));
    
    // Use JavaScript to click the element (more reliable)
    await driver.executeScript("arguments[0].click();", databaseLink);
    
    // Wait for navigation to complete
    await driver.wait(until.urlContains('client_submissions.html'), 10000);
    
    // Verify we are on the client submissions page
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('client_submissions.html');
    
    // Verify the page title is present
    const pageTitle = await driver.findElement(By.className('header'));
    const titleText = await pageTitle.getText();
    expect(titleText).toBe('Client Submissions');
    
    // Check that key elements are present
    const clientList = await driver.findElement(By.id('client-list'));
    expect(clientList).toBeDefined();
    
    // Navigate back to the dashboard
    const backButton = await driver.findElement(By.css('.header-buttons button:nth-child(2)'));
    await driver.executeScript("arguments[0].click();", backButton);
    
    // Verify we're back on the dashboard
    await driver.wait(until.urlContains('dashboard.html'), 10000);
  });

  // Test 5: Check sign out functionality works
  test('Sign out button works correctly', async () => {
    // Find the sign out button
    const signOutButton = await driver.findElement(By.css('.logout button'));
    
    // Use JavaScript to click the button (more reliable)
    await driver.executeScript("arguments[0].click();", signOutButton);
    
    // Wait for redirection to login page
    await driver.wait(until.urlContains('login.html'), 10000);
    
    // Verify we are on the login page
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('login.html');
    
    // Verify login form is visible
    const loginForm = await driver.findElement(By.id('login-form'));
    const isDisplayed = await loginForm.isDisplayed();
    expect(isDisplayed).toBe(true);
  });
});