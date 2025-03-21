/*
  *** Functional Testing using Selenium WebDriver ***
          before testing make sure:
            1- Inside your project folder, install the Selenium WebDriver package:
              npm install selenium-webdriver
            2- Install a WebDriver for Your Browser:
              for windows and Chrome: 
                https://sites.google.com/chromium.org/driver/
              for mac with brew: 
                brew install chromedriver

  * This file verifies that all pages correctly load and display text content sourced from JSON files.
  * All static/dynamic text on each page loads from the correct JSON source file
  * Text content matches expected values defined in JSON (no missing or incorrect keys)
  * Pages render without errors or fallback/missing text placeholders
  * Any changes to the JSON files reflect correctly in the UI upon reload
  * Tests cover all major components and sections that depend on JSON content
*/ 

const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

// Increase Jest timeout if necessary (default is 5 seconds)
jest.setTimeout(50000);

let driver;
const baseUrl = 'http://localhost:8000'; //server's URL 

// Load expected JSON values
const indexTitleJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../admin/content/index-title.json'), 'utf-8'));
const indexServicesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../admin/content/index-services.json'), 'utf-8'));
const aboutJson = {
  'about-us': JSON.parse(fs.readFileSync(path.join(__dirname, '../admin/content/about-us.json'), 'utf-8')).text.trim(),
  'about-meet-eric': JSON.parse(fs.readFileSync(path.join(__dirname, '../admin/content/about-meet-eric.json'), 'utf-8')).text.trim()
};

// Setup Selenium WebDriver before all tests
beforeAll(async () => {
  driver = await new Builder().forBrowser('chrome').build();
});

// Quit the driver after all tests
afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

// Functional Tests for Dynamic Content
describe('Functional Tests for Dynamic Content', () => {
  // Test 1: Verify that the login page loads and displays login form elements
  test('Login page loads and displays login form elements', async () => {
    // Load the login page
    await driver.get(`${baseUrl}/admin/login.html`);
    
    // Verify the welcome header text is present
    const welcomeHeader = await driver.findElement(By.tagName('h1'));
    const welcomeText = await welcomeHeader.getText();
    expect(welcomeText).toBe('Welcome');
    
    // Verify the login section header text is present
    const loginHeader = await driver.findElement(By.tagName('h2'));
    const loginText = await loginHeader.getText();
    expect(loginText).toBe('Login');
  });

  // Test 2: Login functionality test: incorrect then correct credentials
  test('Login functionality test: incorrect then correct credentials', async () => {
    // Load the login page
    await driver.get(`${baseUrl}/admin/login.html`);

    // Wait for login input elements to be present
    const usernameInput = await driver.wait(until.elementLocated(By.id('username')), 5000);
    const passwordInput = await driver.wait(until.elementLocated(By.id('password')), 5000);
    // Locate the submit button using a CSS selector for the login button inside the login-button-group
    const submitButton = await driver.findElement(By.css('.login-button-group button.login-button'));

    // ----- Step 1: Attempt login with incorrect credentials -----
    // Clear any existing text and enter wrong username and password
    await usernameInput.clear();
    await usernameInput.sendKeys('wrongUser');
    await passwordInput.clear();
    await passwordInput.sendKeys('wrongPassword');

    // Click the submit button to attempt login with incorrect credentials
    await submitButton.click();

    // Wait for an error message to appear in the error box (the input with id 'textField')
    // The error field is expected to show a login failure message
    const errorField = await driver.wait(until.elementLocated(By.id('textField')), 5000);
    await driver.wait(async () => {
      const errorValue = await errorField.getAttribute('value');
      return errorValue && errorValue.trim().length > 0;
    }, 5000);
    const errorText = await errorField.getAttribute('value');
    // Expect the error text to be non-empty, indicating a login failure
    expect(errorText.trim().length).toBeGreaterThan(0);

    // ----- Step 2: Attempt login with correct credentials -----
    // Clear the username and password fields again
    await usernameInput.clear();
    await passwordInput.clear();
    // Enter correct credentials (update these to valid test credentials)
    await usernameInput.sendKeys('moji');
    await passwordInput.sendKeys('Mojmarose1!');

    // Click the submit button to attempt login with correct credentials
    await submitButton.click();

    // Wait for redirection to the dashboard page (indicated by the URL containing 'dashboard.html')
    await driver.wait(until.urlContains('dashboard.html'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('dashboard.html');

    // Optionally, verify that the dashboard's dynamic content is loaded as expected
    const dynamicContent = await driver.wait(until.elementLocated(By.id('dynamic-content')), 10000);
    const innerHTML = await dynamicContent.getAttribute('innerHTML');
    expect(innerHTML).toContain('Edit Home Page');
  });

  // Test 3: Dashboard page loads and displays dynamic content
  test('Dashboard page loads and displays dynamic content', async () => {
    // Since we are already logged in from the previous test, simply refresh the dashboard page
    await driver.navigate().refresh();
    const dynamicContent = await driver.wait(until.elementLocated(By.id('dynamic-content')), 10000);
    const innerHTML = await dynamicContent.getAttribute('innerHTML');
    // Verify that the expected text (from JSON) is present
    expect(innerHTML).toContain('Edit Home Page');
  });
  
  // Test 3.1: Update and revert dynamic content via the dashboard
  test('Dashboard updates JSON content and reverts successfully', async () => {
    // Navigate to the dashboard
    await driver.get(`${baseUrl}/admin/dashboard.html`);

    // Click on "Home Page" section (ensure it's visible)
    const homeLink = await driver.findElement(By.id('home-link'));
    await homeLink.click();

    // Wait for content to load
    const textarea = await driver.wait(until.elementLocated(By.id('home-page-title')), 10000);
    const updateButton = await driver.findElement(By.xpath("//textarea[@id='home-page-title']/following-sibling::button[text()='Update']"));

    // Save original value
    const originalValue = await textarea.getAttribute('value');

    // Define test update
    const testValue = 'Test Title Update';

    // Update with new value
    await textarea.clear();
    await textarea.sendKeys(testValue);
    await updateButton.click();

    // After update button click
    await driver.wait(until.alertIsPresent(), 5000);
    const alert = await driver.switchTo().alert();
    await alert.accept();

    // Wait briefly for update to process (adjust as needed)
    await driver.sleep(2000);

    // Refresh and verify the updated value persisted
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.id('home-page-title')), 10000);
    const updatedValue = await driver.findElement(By.id('home-page-title')).getAttribute('value');
    expect(updatedValue).toBe(testValue);

    // Revert back to original
    const revertTextarea = await driver.findElement(By.id('home-page-title'));
    const revertButton = await driver.findElement(By.xpath("//textarea[@id='home-page-title']/following-sibling::button[text()='Update']"));
    await revertTextarea.clear();
    await revertTextarea.sendKeys(originalValue);
    await revertButton.click();

    // After revert button click
    await driver.wait(until.alertIsPresent(), 5000);
    const revertAlert = await driver.switchTo().alert();
    await revertAlert.accept();

    // Wait and confirm revert
    await driver.sleep(2000);
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.id('home-page-title')), 10000);
    const revertedValue = await driver.findElement(By.id('home-page-title')).getAttribute('value');
    expect(revertedValue).toBe(originalValue);
  });

  // Test 4: Client Submissions page loads and displays dynamic content
  test('Client Submissions page loads and displays dynamic content', async () => {
    // Load the client submissions page
    await driver.get(`${baseUrl}/admin/client_submissions.html`);
    
    // Verify that the page header contains "Client Submissions"
    const header = await driver.findElement(By.className('header'));
    const headerText = await header.getText();
    expect(headerText).toContain('Client Submissions');
    
    // Check that the client list container exists
    const clientList = await driver.findElement(By.id('client-list'));
    expect(clientList).toBeDefined();
  });

  // Test 5: About Us page loads and displays dynamic content
  test('About Us page loads and displays dynamic content', async () => {
    // Load the about us page
    await driver.get(`${baseUrl}/about-us.html`);
    
    // Wait for the dynamic content for "about-us" and verify it's not empty
    const aboutUsElement = await driver.wait(until.elementLocated(By.id('about-us')), 10000);
    const aboutUsText = await aboutUsElement.getText();
    expect(aboutUsText.trim()).toBe(aboutJson['about-us']);
    
    // Similarly, verify "about-meet-eric" element is populated
    const meetEric = await driver.findElement(By.id('about-meet-eric'));
    const meetEricText = await meetEric.getText();
    expect(meetEricText.trim()).toBe(aboutJson['about-meet-eric']);
  });

  // Test 6: Index page loads and displays dynamic content
  test('Index page loads and displays dynamic content', async () => {
    // Load the home/index page
    await driver.get(`${baseUrl}/index.html`);
    
    // Wait for the title element and verify it is populated
    const titleElement = await driver.wait(until.elementLocated(By.id('title')), 10000);
    const titleText = await titleElement.getText();
    expect(titleText.trim()).toBe(indexTitleJson.text.trim());
    
    // Verify that each service description element (loaded from JSON) has content
    const serviceIds = ['services-Chapter7', 'services-Chapter11', 'services-Chapter12', 'services-Chapter13'];
    for (const id of serviceIds) {
      const element = await driver.findElement(By.id(id));
      const text = await element.getText();

      // Load expected text from corresponding JSON file
      const serviceJsonPath = path.join(__dirname, `../admin/content/${id}.json`);
      const expectedServiceText = JSON.parse(fs.readFileSync(serviceJsonPath, 'utf-8')).text.trim();
      expect(text.trim()).toBe(expectedServiceText);
    }
  });

  // Test 7: Reviews page loads and displays dynamic review content
  test('Reviews page loads and displays dynamic review content', async () => {
    // Load the reviews page
    await driver.get(`${baseUrl}/reviews.html`);
    
    // Wait for the reviews container (Google reviews in this example) to be present
    const reviewsContainer = await driver.wait(until.elementLocated(By.id('google-reviews-container')), 10000);
    const containerText = await reviewsContainer.getText();
    // Verify that the fallback "Loading reviews..." is not present
    expect(containerText).not.toContain('Loading reviews...');
  });

  // Test 8: Services page loads and displays dynamic content
  test('Services page loads and displays dynamic content', async () => {
    // Load the services page
    await driver.get(`${baseUrl}/services.html`);
    
    // Verify that all service-related text containers have non-empty content
    const serviceIds = [
      'services-Chapter7',
      'services-Chapter11',
      'services-Chapter12',
      'services-Chapter13',
      'why-choose-us',
      'service-benefits'
    ];
    for (const id of serviceIds) {
      const element = await driver.wait(until.elementLocated(By.id(id)), 10000);
      const text = await element.getText();
      expect(text).not.toBe('');
    }
  });
});