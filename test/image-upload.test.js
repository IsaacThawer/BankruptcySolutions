// npm install selenium-webdriver
// npm install jest-image-matcher
    // ^ this also requires babel, use npm install --save-dev babel-jest @babel/core @babel/preset-env
    // requires jest.config.js and babel.config.js
// Import necessary modules from Selenium WebDriver
const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const { toMatchImage } = require('jest-image-matcher');
expect.extend({ toMatchImage })

// Set a longer timeout for the entire test suite
jest.setTimeout(60000);

const baseUrl = 'http://localhost:8000/admin/login.html';
const adminUsername = 'username';    // change to valid username
const adminPassword = 'password';    // change to valid password

describe('Home Page Image Upload Tests', () => {
        let driver;

        const imageName = 'banner-index.png'; // Name of the image
        const testImageFolder = path.join(__dirname, './testFiles'); // Path to the test image
        const webImageFolder = path.join(__dirname, '../public/images/'); // Path to the image in the web directory

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
            await driver.quit();
        });

        afterEach(async () => {
            // Move all backup images to original folder
            const backupFilePath = path.join(testImageFolder, 'imageBackup', imageName);
            const originalFilePath = path.join(webImageFolder, imageName);
            await new Promise((resolve, reject) => {
                fs.copyFile(backupFilePath, originalFilePath, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
            //refresh the page
            driver.get('http://localhost:8000/admin/dashboard.html');
            await driver.sleep(500);
        });

        test('Upload an image file', async () => {
            // get the test image
            const testImagePath = path.resolve(testImageFolder, 'test.png');

            // place the image into the upload form
            const inputForm = await driver.wait(until.elementLocated(By.id('image')), 10000);
            await driver.wait(until.elementIsVisible(inputForm), 10000);
            await inputForm.sendKeys(testImagePath);

            // press the upload button
            const uploadBtn = await driver.findElement(By.id('upload-btn'));
            await driver.wait(until.elementIsVisible(uploadBtn), 10000);
            await uploadBtn.click();

            // wait for the upload to process
            await driver.sleep(500);

            // check the upload status text is correct
            const uploadStatus = await driver.findElement(By.id('upload-status'));
            const statusText = await uploadStatus.getText();
            expect(statusText).toBe("Image uploaded successfully!");

            // check the uploaded image is the same as the test image
            const uploadedImagePath = path.join(webImageFolder, imageName);
            const uploadedImage = fs.readFileSync(uploadedImagePath);
            const testImage = fs.readFileSync(testImagePath);
            expect(uploadedImage).toMatchImage(testImage);
        });

        test('Upload a non-image file', async () => {
            // get the test image
            const testImagePath = path.resolve(testImageFolder, 'test.txt');

            // place the image into the upload form
            const inputForm = await driver.wait(until.elementLocated(By.id('image')), 10000);
            await driver.wait(until.elementIsVisible(inputForm), 10000);
            await inputForm.sendKeys(testImagePath);

            // press the upload button
            const uploadBtn = await driver.findElement(By.id('upload-btn'));
            await driver.wait(until.elementIsVisible(uploadBtn), 10000);
            await uploadBtn.click();

            // wait for the upload to process
            await driver.sleep(500);

            // check the upload status text is correct
            const uploadStatus = await driver.findElement(By.id('upload-status'));
            const statusText = await uploadStatus.getText();
            expect(statusText).toBe("The selected file is not an image.");

            // check the uploaded image is unchanged
            const uploadedImagePath = path.join(webImageFolder, imageName);
            const uploadedImage = fs.readFileSync(uploadedImagePath);
            const backupImagePath = path.join(testImageFolder, 'imageBackup', imageName);
            const backupImage = fs.readFileSync(backupImagePath);
            expect(uploadedImage).toMatchImage(backupImage, { diffPath: 'diff.png' });
        });

        test('Upload nothing', async () => {
            // press the upload button
            const uploadBtn = await driver.findElement(By.id('upload-btn'));
            await driver.wait(until.elementIsVisible(uploadBtn), 10000);
            await uploadBtn.click();

            // wait for the upload to process
            await driver.sleep(500);

            // check the upload status text is correct
            const uploadStatus = await driver.findElement(By.id('upload-status'));
            const statusText = await uploadStatus.getText();
            expect(statusText).toBe("Please select an image file.");

            // check the uploaded image is unchanged
            const uploadedImagePath = path.join(webImageFolder, imageName);
            const uploadedImage = fs.readFileSync(uploadedImagePath);
            const backupImagePath = path.join(testImageFolder, 'imageBackup', imageName);
            const backupImage = fs.readFileSync(backupImagePath);
            expect(uploadedImage).toMatchImage(backupImage);
        });
});

describe('Services Page Image Upload Tests', () => {
    let driver;

    const imageName = 'banner-services.png'; // Name of the image
    const testImageFolder = path.join(__dirname, './testFiles'); // Path to the test image
    const webImageFolder = path.join(__dirname, '../public/images/'); // Path to the image in the web directory

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

        // Navigate to the Services page
        const link = await driver.findElement(By.id('services-link'));
        await link.click();
        await driver.sleep(500);

    });
    afterAll(async () => {
        // Clean up by closing the browser
        await driver.quit();
    });

    afterEach(async () => {
        // Move all backup images to original folder
        const backupFilePath = path.join(testImageFolder, 'imageBackup', imageName);
        const originalFilePath = path.join(webImageFolder, imageName);
        await new Promise((resolve, reject) => {
            fs.copyFile(backupFilePath, originalFilePath, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        //refresh the page
        driver.get('http://localhost:8000/admin/dashboard.html');
        await driver.sleep(500);
    });

    test('Upload an image file', async () => {
        // get the test image
        const testImagePath = path.resolve(testImageFolder, 'test.png');

        // place the image into the upload form
        const inputForm = await driver.wait(until.elementLocated(By.id('image')), 10000);
        await driver.wait(until.elementIsVisible(inputForm), 10000);
        await inputForm.sendKeys(testImagePath);

        // press the upload button
        const uploadBtn = await driver.findElement(By.id('upload-btn'));
        await driver.wait(until.elementIsVisible(uploadBtn), 10000);
        await uploadBtn.click();

        // wait for the upload to process
        await driver.sleep(500);

        // check the upload status text is correct
        const uploadStatus = await driver.findElement(By.id('upload-status'));
        const statusText = await uploadStatus.getText();
        expect(statusText).toBe("Image uploaded successfully!");

        // check the uploaded image is the same as the test image
        const uploadedImagePath = path.join(webImageFolder, imageName);
        const uploadedImage = fs.readFileSync(uploadedImagePath);
        const testImage = fs.readFileSync(testImagePath);
        expect(uploadedImage).toMatchImage(testImage);
    });

    test('Upload a non-image file', async () => {
        // get the test image
        const testImagePath = path.resolve(testImageFolder, 'test.txt');

        // place the image into the upload form
        const inputForm = await driver.wait(until.elementLocated(By.id('image')), 10000);
        await driver.wait(until.elementIsVisible(inputForm), 10000);
        await inputForm.sendKeys(testImagePath);

        // press the upload button
        const uploadBtn = await driver.findElement(By.id('upload-btn'));
        await driver.wait(until.elementIsVisible(uploadBtn), 10000);
        await uploadBtn.click();

        // wait for the upload to process
        await driver.sleep(500);

        // check the upload status text is correct
        const uploadStatus = await driver.findElement(By.id('upload-status'));
        const statusText = await uploadStatus.getText();
        expect(statusText).toBe("The selected file is not an image.");

        // check the uploaded image is unchanged
        const uploadedImagePath = path.join(webImageFolder, imageName);
        const uploadedImage = fs.readFileSync(uploadedImagePath);
        const backupImagePath = path.join(testImageFolder, 'imageBackup', imageName);
        const backupImage = fs.readFileSync(backupImagePath);
        expect(uploadedImage).toMatchImage(backupImage, { diffPath: 'diff.png' });
    });

    test('Upload nothing', async () => {
        // press the upload button
        const uploadBtn = await driver.findElement(By.id('upload-btn'));
        await driver.wait(until.elementIsVisible(uploadBtn), 10000);
        await uploadBtn.click();

        // wait for the upload to process
        await driver.sleep(500);

        // check the upload status text is correct
        const uploadStatus = await driver.findElement(By.id('upload-status'));
        const statusText = await uploadStatus.getText();
        expect(statusText).toBe("Please select an image file.");

        // check the uploaded image is unchanged
        const uploadedImagePath = path.join(webImageFolder, imageName);
        const uploadedImage = fs.readFileSync(uploadedImagePath);
        const backupImagePath = path.join(testImageFolder, 'imageBackup', imageName);
        const backupImage = fs.readFileSync(backupImagePath);
        expect(uploadedImage).toMatchImage(backupImage);
    });
});

describe('About Us Page Image Upload Tests', () => {
    let driver;

    const imageName = 'banner-about.png'; // Name of the image
    const testImageFolder = path.join(__dirname, './testFiles'); // Path to the test image
    const webImageFolder = path.join(__dirname, '../public/images/'); // Path to the image in the web directory

    // List of admin panel sections to test
    const sections = [
        { id: 'home-link', title: 'Edit Home Page' },
        { id: 'services-link', title: 'Edit Services Page' },
        { id: 'about-us-link', title: 'Edit About Us Page' },
        { id: 'reviews-link', title: 'Google Reviews' }, // Looking for a header in the Reviews section
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

        // Navigate to the Services page
        const link = await driver.findElement(By.id('about-us-link'));
        await link.click();
        await driver.sleep(500);

    });
    afterAll(async () => {
        // Clean up by closing the browser
        await driver.quit();
    });

    afterEach(async () => {
        // Move all backup images to original folder
        const backupFilePath = path.join(testImageFolder, 'imageBackup', imageName);
        const originalFilePath = path.join(webImageFolder, imageName);
        await new Promise((resolve, reject) => {
            fs.copyFile(backupFilePath, originalFilePath, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        //refresh the page
        driver.get('http://localhost:8000/admin/dashboard.html');
        await driver.sleep(500);
    });

    test('Upload an image file', async () => {
        // get the test image
        const testImagePath = path.resolve(testImageFolder, 'test.png');

        // place the image into the upload form
        const inputForm = await driver.wait(until.elementLocated(By.id('image')), 10000);
        await driver.wait(until.elementIsVisible(inputForm), 10000);
        await inputForm.sendKeys(testImagePath);

        // press the upload button
        const uploadBtn = await driver.findElement(By.id('upload-btn'));
        await driver.wait(until.elementIsVisible(uploadBtn), 10000);
        await uploadBtn.click();

        // wait for the upload to process
        await driver.sleep(500);

        // check the upload status text is correct
        const uploadStatus = await driver.findElement(By.id('upload-status'));
        const statusText = await uploadStatus.getText();
        expect(statusText).toBe("Image uploaded successfully!");

        // check the uploaded image is the same as the test image
        const uploadedImagePath = path.join(webImageFolder, imageName);
        const uploadedImage = fs.readFileSync(uploadedImagePath);
        const testImage = fs.readFileSync(testImagePath);
        expect(uploadedImage).toMatchImage(testImage);
    });

    test('Upload a non-image file', async () => {
        // get the test image
        const testImagePath = path.resolve(testImageFolder, 'test.txt');

        // place the image into the upload form
        const inputForm = await driver.wait(until.elementLocated(By.id('image')), 10000);
        await driver.wait(until.elementIsVisible(inputForm), 10000);
        await inputForm.sendKeys(testImagePath);

        // press the upload button
        const uploadBtn = await driver.findElement(By.id('upload-btn'));
        await driver.wait(until.elementIsVisible(uploadBtn), 10000);
        await uploadBtn.click();

        // wait for the upload to process
        await driver.sleep(500);

        // check the upload status text is correct
        const uploadStatus = await driver.findElement(By.id('upload-status'));
        const statusText = await uploadStatus.getText();
        expect(statusText).toBe("The selected file is not an image.");

        // check the uploaded image is unchanged
        const uploadedImagePath = path.join(webImageFolder, imageName);
        const uploadedImage = fs.readFileSync(uploadedImagePath);
        const backupImagePath = path.join(testImageFolder, 'imageBackup', imageName);
        const backupImage = fs.readFileSync(backupImagePath);
        expect(uploadedImage).toMatchImage(backupImage, { diffPath: 'diff.png' });
    });

    test('Upload nothing', async () => {
        // press the upload button
        const uploadBtn = await driver.findElement(By.id('upload-btn'));
        await driver.wait(until.elementIsVisible(uploadBtn), 10000);
        await uploadBtn.click();

        // wait for the upload to process
        await driver.sleep(500);

        // check the upload status text is correct
        const uploadStatus = await driver.findElement(By.id('upload-status'));
        const statusText = await uploadStatus.getText();
        expect(statusText).toBe("Please select an image file.");

        // check the uploaded image is unchanged
        const uploadedImagePath = path.join(webImageFolder, imageName);
        const uploadedImage = fs.readFileSync(uploadedImagePath);
        const backupImagePath = path.join(testImageFolder, 'imageBackup', imageName);
        const backupImage = fs.readFileSync(backupImagePath);
        expect(uploadedImage).toMatchImage(backupImage);
    });
});

describe('Reviews Page Image Upload Tests', () => {
    let driver;

    const imageName = 'banner-reviews.png'; // Name of the image
    const testImageFolder = path.join(__dirname, './testFiles'); // Path to the test image
    const webImageFolder = path.join(__dirname, '../public/images/'); // Path to the image in the web directory

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

        // Navigate to the Services page
        const link = await driver.findElement(By.id('reviews-link'));
        await link.click();
        await driver.sleep(500);

    });
    afterAll(async () => {
        // Clean up by closing the browser
        await driver.quit();
    });

    afterEach(async () => {
        // Move all backup images to original folder
        const backupFilePath = path.join(testImageFolder, 'imageBackup', imageName);
        const originalFilePath = path.join(webImageFolder, imageName);
        await new Promise((resolve, reject) => {
            fs.copyFile(backupFilePath, originalFilePath, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
        //refresh the page
        driver.get('http://localhost:8000/admin/dashboard.html');
        await driver.sleep(500);
    });

    test('Upload an image file', async () => {
        // get the test image
        const testImagePath = path.resolve(testImageFolder, 'test.png');

        // place the image into the upload form
        const inputForm = await driver.wait(until.elementLocated(By.id('image')), 10000);
        await driver.wait(until.elementIsVisible(inputForm), 10000);
        await inputForm.sendKeys(testImagePath);

        // press the upload button
        const uploadBtn = await driver.findElement(By.id('upload-btn'));
        await driver.wait(until.elementIsVisible(uploadBtn), 10000);
        await uploadBtn.click();

        // wait for the upload to process
        await driver.sleep(500);

        // check the upload status text is correct
        const uploadStatus = await driver.findElement(By.id('upload-status'));
        const statusText = await uploadStatus.getText();
        expect(statusText).toBe("Image uploaded successfully!");

        // check the uploaded image is the same as the test image
        const uploadedImagePath = path.join(webImageFolder, imageName);
        const uploadedImage = fs.readFileSync(uploadedImagePath);
        const testImage = fs.readFileSync(testImagePath);
        expect(uploadedImage).toMatchImage(testImage);
    });

    test('Upload a non-image file', async () => {
        // get the test image
        const testImagePath = path.resolve(testImageFolder, 'test.txt');

        // place the image into the upload form
        const inputForm = await driver.wait(until.elementLocated(By.id('image')), 10000);
        await driver.wait(until.elementIsVisible(inputForm), 10000);
        await inputForm.sendKeys(testImagePath);

        // press the upload button
        const uploadBtn = await driver.findElement(By.id('upload-btn'));
        await driver.wait(until.elementIsVisible(uploadBtn), 10000);
        await uploadBtn.click();

        // wait for the upload to process
        await driver.sleep(500);

        // check the upload status text is correct
        const uploadStatus = await driver.findElement(By.id('upload-status'));
        const statusText = await uploadStatus.getText();
        expect(statusText).toBe("The selected file is not an image.");

        // check the uploaded image is unchanged
        const uploadedImagePath = path.join(webImageFolder, imageName);
        const uploadedImage = fs.readFileSync(uploadedImagePath);
        const backupImagePath = path.join(testImageFolder, 'imageBackup', imageName);
        const backupImage = fs.readFileSync(backupImagePath);
        expect(uploadedImage).toMatchImage(backupImage, { diffPath: 'diff.png' });
    });

    test('Upload nothing', async () => {
        // press the upload button
        const uploadBtn = await driver.findElement(By.id('upload-btn'));
        await driver.wait(until.elementIsVisible(uploadBtn), 10000);
        await uploadBtn.click();

        // wait for the upload to process
        await driver.sleep(500);

        // check the upload status text is correct
        const uploadStatus = await driver.findElement(By.id('upload-status'));
        const statusText = await uploadStatus.getText();
        expect(statusText).toBe("Please select an image file.");

        // check the uploaded image is unchanged
        const uploadedImagePath = path.join(webImageFolder, imageName);
        const uploadedImage = fs.readFileSync(uploadedImagePath);
        const backupImagePath = path.join(testImageFolder, 'imageBackup', imageName);
        const backupImage = fs.readFileSync(backupImagePath);
        expect(uploadedImage).toMatchImage(backupImage);
    });
});