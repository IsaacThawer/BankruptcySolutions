/**
 * @jest-environment jsdom
 */
const fs = require("fs");
const path = require("path");
const { uploadImage } = require('../admin/js/upload-image');
const fetch = require('node-fetch');
const nodeFetch = require('node-fetch');
global.fetch = (url, options) => {
    // If url is relative (starts with "/"), prepend the server's absolute URL.
    if (url.startsWith('/')) {
        // Change the port if necessary (e.g., http://localhost:8000)
        url = `http://localhost:8000${url}`;
    }
    return nodeFetch(url, options);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: create a File object from a file on disk.
// This uses the File constructor provided by jsdom (if available) so that the uploaded
// file has a valid .name, .size, and .type.
function createMockFile(filePath, fileName, mimeType) {
    const buffer = fs.readFileSync(filePath);
    // In a jsdom environment, File should be available.
    return new File([buffer], fileName, { type: mimeType });
}

// Define the output path for an uploaded file.
const outputDir = path.join(__dirname, "../public/images");
const outputFile = path.join(outputDir, "test.jpg");

describe('uploadImage', () => {
    let originalAlert;

    beforeAll(() => {
        // Save the original alert function.
        originalAlert = window.alert;
        // Ensure that relative URL fetch calls resolve correctly.
        Object.defineProperty(window, 'location', {
            writable: true,
            value: new URL('http://localhost:8000')
        });
    });

    afterAll(() => {
        // Restore the original alert.
        window.alert = originalAlert;
    });

    beforeEach(() => {
        jest.resetAllMocks();
        // Override alert so we can later inspect its calls.
        window.alert = jest.fn();
        // Add the necessary input element to the DOM.
        document.body.innerHTML = `<input type="file" id="image" accept="image/*" required>`;
        // Clean up any previously saved file.
        if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
        }
    });

    afterEach(() => {
        // Clean up the output file for isolation between tests.
        if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
        }
    });

    test("uploads a .jpg image", async () => {
        const jpgPath = path.join(__dirname, "testFiles", "test.jpg");
        const mockFile = createMockFile(jpgPath, "test.jpg", "image/jpeg");

        const input = document.getElementById("image");
        Object.defineProperty(input, 'files', {
            value: [mockFile],
            writable: false,
        });

        const fakeEvent = { preventDefault: jest.fn() };

        // Call the function (this triggers the real fetch to your server).
        await uploadImage(fakeEvent);

        // Wait a short while for the asynchronous fetch call to complete.
        await delay(500);

        // Verify the event and the alert calls.
        expect(fakeEvent.preventDefault).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith("Image successfully uploaded.");

        // Check that the file was actually written and its size matches the test file.
        expect(fs.existsSync(outputFile)).toBe(true);
        const stats = fs.statSync(outputFile);
        expect(stats.size).toBe(mockFile.size);
    });
});