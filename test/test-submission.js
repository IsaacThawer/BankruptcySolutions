const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testMultipleSubmissions() {
  const options = new chrome.Options();
  options.addArguments('--headless');  // Optional: run headless if you don't want the browser window to show up

  let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get('http://localhost:8000'); // Replace with your URL

    // Data for multiple submissions
    const testData = [
      { firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com', phone: '(123)-456-7890', message: 'Need help with bankruptcy.' },
      { firstname: 'Jane', lastname: 'Smith', email: 'jane.smith@example.com', phone: '(987)-654-3210', message: 'Looking for debt relief options.' },
      { firstname: 'Alice', lastname: 'Johnson', email: 'alice.johnson@example.com', phone: '(555)-123-4567', message: 'Bankruptcy help for small business.' },
    ];

    // Loop through the test data to submit the form multiple times
    for (const data of testData) {
      // Fill out the form
      await driver.findElement(By.id('firstname')).sendKeys(data.firstname);
      await driver.findElement(By.id('lastname')).sendKeys(data.lastname);
      await driver.findElement(By.id('email')).sendKeys(data.email);
      await driver.findElement(By.id('phone')).sendKeys(data.phone);
      await driver.findElement(By.id('message')).sendKeys(data.message);
      
      // Submit the form
      await driver.findElement(By.css('input[type="submit"]')).click();

      // Wait for success message (adjust the selector if necessary)
      await driver.wait(until.elementLocated(By.css('.success-message')), 5000);

      // Check that the success message appears
      let successMessage = await driver.findElement(By.css('.success-message')).getText();
      console.log(`Test Passed: ${successMessage}`);

      // Wait for the page to reload or reset the form
      await driver.navigate().refresh();
    }
  } catch (error) {
    console.log('Test Failed:', error);
  } finally {
    await driver.quit();
  }
}

testMultipleSubmissions();
