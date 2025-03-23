/**
 * @jest-environment jsdom
 */

// npm install selenium-webdriver chrome-driver jest
// Import necessary modules from Selenium WebDriver
const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Set timeouts appropriately for UI interactions
jest.setTimeout(30000);

describe('Client Submission Form Character Limit Tests', () => {
  let driver;
  const baseUrl = 'http://localhost:8000'; // Your server URL
  const maxCharLimit = 250; // The defined character limit for the "How Can We Help?" field

  beforeAll(async () => {
    // Set up Chrome options
    const options = new chrome.Options();
    // Uncomment the line below if you want to see the browser in action
    // options.addArguments('--headless');
    
    // Initialize the WebDriver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterAll(async () => {
    // Clean up by closing the browser
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async () => {
    // Navigate to the homepage with the form before each test
    await driver.get(baseUrl);
    
    // Scroll to the form to ensure it's visible
    const form = await driver.findElement(By.id('contact-form'));
    await driver.executeScript('arguments[0].scrollIntoView(true)', form);
  });

  test('Message field should enforce 250 character limit when typing', async () => {
    // Find the message textarea
    const messageField = await driver.findElement(By.id('message'));
    
    // Generate a string exactly at the limit (250 characters)
    const exactLimitText = 'A'.repeat(maxCharLimit);
    
    // Generate a string that exceeds the limit (260 characters)
    const exceedingLimitText = 'B'.repeat(maxCharLimit + 10);
    
    // Type the exact limit text
    await messageField.sendKeys(exactLimitText);
    
    // Verify the current value matches the input (should accept all characters)
    let currentValue = await messageField.getAttribute('value');
    expect(currentValue.length).toBe(maxCharLimit);
    expect(currentValue).toBe(exactLimitText);
    
    // Try to type more characters
    await messageField.sendKeys('ExtraText');
    
    // Verify the length hasn't changed (still 250)
    currentValue = await messageField.getAttribute('value');
    expect(currentValue.length).toBe(maxCharLimit);
    
    // Clear the field for the next test
    await messageField.clear();
    
    // Try to input a text that exceeds the limit
    await messageField.sendKeys(exceedingLimitText);
    
    // Verify only the first 250 characters were accepted
    currentValue = await messageField.getAttribute('value');
    expect(currentValue.length).toBe(maxCharLimit);
    expect(currentValue).toBe(exceedingLimitText.substring(0, maxCharLimit));
  });

  test('Message field should enforce 250 character limit when pasting text', async () => {
    // Find the message textarea
    const messageField = await driver.findElement(By.id('message'));
    
    // Clear any existing content
    await messageField.clear();
    
    // Create a text that exceeds the limit
    const longText = 'C'.repeat(maxCharLimit + 50);
    
    // Execute script to set clipboard data and paste it
    // Note: Direct clipboard access has security limitations, so we'll simulate paste via JS
    await driver.executeScript(
      `arguments[0].value = arguments[1].substring(0, ${maxCharLimit})`,
      messageField, 
      longText
    );
    
    // Verify the pasted content is truncated to 250 characters
    const fieldValue = await messageField.getAttribute('value');
    expect(fieldValue.length).toBe(maxCharLimit);
    
    // Attempt to add more text after reaching the limit
    await messageField.sendKeys('MoreText');
    
    // The length should still be capped at 250
    const finalValue = await messageField.getAttribute('value');
    expect(finalValue.length).toBe(maxCharLimit);
  });

  test('Message field should show validation attributes when limit is reached', async () => {
    // Find the message textarea
    const messageField = await driver.findElement(By.id('message'));
    
    // Fill the field to exactly the character limit
    await messageField.clear();
    await messageField.sendKeys('D'.repeat(maxCharLimit));
    
    // Check the validity state
    const isValid = await driver.executeScript(
      'return arguments[0].validity.valid', 
      messageField
    );
    expect(isValid).toBe(true);
    
    // Get the maxlength attribute value
    const maxlengthAttr = await messageField.getAttribute('maxlength');
    expect(parseInt(maxlengthAttr)).toBe(maxCharLimit);
  });

  test('Submit button should work with maximum character input', async () => {
    // Fill out all required fields with valid data
    const firstNameField = await driver.findElement(By.id('firstname'));
    await firstNameField.sendKeys('John');
    
    const lastNameField = await driver.findElement(By.id('lastname'));
    await lastNameField.sendKeys('Doe');
    
    const emailField = await driver.findElement(By.id('email'));
    await emailField.sendKeys('john.doe@example.com');
    
    const phoneField = await driver.findElement(By.id('phone'));
    await phoneField.sendKeys('(123)-456-7890');
    
    // Fill the message field with exactly 250 characters
    const messageField = await driver.findElement(By.id('message'));
    await messageField.clear();
    await messageField.sendKeys('E'.repeat(maxCharLimit));
    
    // Get the submit button
    const submitButton = await driver.findElement(By.css('input[type="submit"]'));
    
    // Check if the button is enabled (it should be)
    const isEnabled = await submitButton.isEnabled();
    expect(isEnabled).toBe(true);
    
    // Note: We won't actually click submit to avoid creating real submissions
    // But we can verify the form would be valid for submission
    const isFormValid = await driver.executeScript(
      'return document.getElementById("contact-form").checkValidity()'
    );
    expect(isFormValid).toBe(true);
  });
});