// Functional test using Selenium WebDriver + Jest
// This test logs in, signs out, and verifies that browser back/forward buttons
// do not allow navigation to protected pages without re-authentication

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

jest.setTimeout(50000);

let driver;
const baseUrl = 'http://localhost:8000';

// Setup Selenium WebDriver before all tests
beforeAll(async () => {
  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options())
    .build();
});

// Quit the WebDriver after all tests
afterAll(async () => {
  if (driver) await driver.quit();
});

// Helper function to log in with valid test credentials
async function loginToDashboard() {
  await driver.get(`${baseUrl}/admin/login.html`);

  const username = await driver.wait(until.elementLocated(By.id('username')), 5000);
  const password = await driver.wait(until.elementLocated(By.id('password')), 5000);
  const loginBtn = await driver.findElement(By.css('.login-button-group button.login-button'));

  await username.clear();
  await username.sendKeys('moji');
  await password.clear();
  await password.sendKeys('Mojmarose1!');
  await loginBtn.click();

  // Wait until dashboard is loaded
  await driver.wait(until.urlContains('dashboard.html'), 10000);
}

// Test 1: Sign out from dashboard and try using back and forward
test('Sign out from dashboard and test not navigating back to dashboard', async () => {
  await loginToDashboard();

  // Click the logout button by finding the button with "Sign Out" text inside the .logout div
  const logoutBtn = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'logout')]//button[contains(text(), 'Sign Out')]")), 5000);
  await logoutBtn.click();

  // Ensure redirect to login
  await driver.wait(until.urlContains('login.html'), 5000);
  const loginField = await driver.findElement(By.id('username'));
  expect(await loginField.isDisplayed()).toBe(true);

  // Try to go back
  await driver.navigate().back();
  await driver.wait(until.urlContains('login.html'), 5000);
  expect(await driver.getCurrentUrl()).toContain('login.html');

  // Try to go forward
  await driver.navigate().forward();
  await driver.wait(until.urlContains('login.html'), 5000);
  expect(await driver.getCurrentUrl()).toContain('login.html');
});

// Test 2: Sign out from client_submissions and try using back and forward
test('Sign out from client_submissions and prevent navigating back', async () => {
  await loginToDashboard();

  // Go to client_submissions page
  await driver.get(`${baseUrl}/admin/client_submissions.html`);
  await driver.wait(until.urlContains('client_submissions'), 5000);

  // Click logout using xpath selector since no id is set
  const logoutBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Sign Out')]")), 5000);
  await logoutBtn.click();

  // Ensure redirect to login
  await driver.wait(until.urlContains('login.html'), 5000);
  const loginField = await driver.findElement(By.id('username'));
  expect(await loginField.isDisplayed()).toBe(true);

  // Try to go back
  await driver.navigate().back();
  await driver.wait(until.urlContains('login.html'), 5000);
  expect(await driver.getCurrentUrl()).toContain('login.html');

  // Try to go forward
  await driver.navigate().forward();
  await driver.wait(until.urlContains('login.html'), 5000);
  expect(await driver.getCurrentUrl()).toContain('login.html');
});
