/**
 * @jest-environment jsdom
 */
const { readImage, readImageBackground } = require('../public/js/read-image');
if (!URL.createObjectURL) {
    URL.createObjectURL = jest.fn(() => 'blob:fakeURL');
}

describe('readImage', () => {
    const contID = 'portrait';
    const fileName = 'portrait.png';
    let imgElement;

    beforeEach(() => {
        // Create an <img> element with the required ID and add it to the document
        imgElement = document.createElement('img');
        imgElement.id = contID;
        document.body.appendChild(imgElement);
    });

    afterEach(() => {
        // Clean up the document and restore mocks
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    test('should set img src when fetch is successful', async () => {
        const fakeBlob = 'fakeBlobData';
        const fakeURL = 'blob:fakeURL';

        // Mock fetch to return a successful response with a blob
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            blob: jest.fn().mockResolvedValue(fakeBlob)
        });

        // Spy on URL.createObjectURL to return a fake URL
        jest.spyOn(URL, 'createObjectURL').mockReturnValue(fakeURL);

        await readImage(contID, fileName);

        // Check that fetch was called with the correct URL and method
        expect(fetch).toHaveBeenCalledWith(`/images/${fileName}`, { method: 'GET' });
        // Verify that URL.createObjectURL was called with the fake blob
        expect(URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
        // Check that the image's src property was updated
        expect(document.getElementById(contID).src).toBe(fakeURL);
    });

    test('should log error when fetch fails', async () => {
        // Mock fetch to return a failed response
        global.fetch = jest.fn().mockResolvedValue({
            ok: false
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        await readImage(contID, fileName);

        // Check that fetch was called with the correct URL and method
        expect(fetch).toHaveBeenCalledWith(`/images/${fileName}`, { method: 'GET' });
        // Verify that console.error was called with the expected error message
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load image: ', fileName);
    });
});

describe('readImageBackground', () => {
    const contID = 'banner';
    const fileName = 'index-banner.jpg';
    let divElement;

    beforeEach(() => {
        // Create a <div> element with the required ID and add it to the document
        divElement = document.createElement('div');
        divElement.id = contID;
        document.body.appendChild(divElement);
    });

    afterEach(() => {
        // Clean up the document and restore mocks
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    test('should set backgroundImage style when fetch is successful', async () => {
        const fakeBlob = 'fakeBlobData';
        const fakeURL = 'blob:fakeURL';

        // Mock fetch to return a successful response with a blob
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            blob: jest.fn().mockResolvedValue(fakeBlob)
        });

        // Spy on URL.createObjectURL to return a fake URL
        jest.spyOn(URL, 'createObjectURL').mockReturnValue(fakeURL);

        await readImageBackground(contID, fileName);

        // Check that fetch was called with the correct URL and method
        expect(fetch).toHaveBeenCalledWith(`/images/${fileName}`, { method: 'GET' });
        // Verify that URL.createObjectURL was called with the fake blob
        expect(URL.createObjectURL).toHaveBeenCalledWith(fakeBlob);
        // Check that the element's backgroundImage style was updated correctly
        expect(document.getElementById(contID).style.backgroundImage).toBe(`url(${fakeURL})`);
    });

    test('should log error when fetch fails', async () => {
        // Mock fetch to return a failed response
        global.fetch = jest.fn().mockResolvedValue({
            ok: false
        });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        await readImageBackground(contID, fileName);

        // Check that fetch was called with the correct URL and method
        expect(fetch).toHaveBeenCalledWith(`/images/${fileName}`, { method: 'GET' });
        // Verify that console.error was called with the expected error message
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load image: ', fileName);
    });
});
