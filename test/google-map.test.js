/**
* @jest-environmnet jsdom
*/

const {loadMap} = require('../public/js/google-map');

describe('Unit Testing for google-map.js file ', () => {
 beforeEach(() => {
   document.body.innerHTML = '<iframe id = "GMap" src=""></iframe>';
   global.fetch = jest.fn();
   global.console.error = jest.fn();
   jest.clearAllMocks();
   fetch.mockClear();
 });

 // Test case for fetching the json file
 test('Verify that fetch is functional',async () => {
   await loadMap();

   expect(fetch).toHaveBeenCalledWith('/admin/content/index-map.json');
   //expect(loadMap).toHaveBeenCalledTimes(1);
 });
 
 // Test case for when it fails to fetch the json file
 test('Simulate failed fetch to display error',async () => {
   // Simulate error
   const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
   fetch.mockRejectedValueOnce(new Error("Failed to fetch"));

   await loadMap();
   // Expect fetch failure message rather than success
   expect(consoleSpy).toHaveBeenCalledWith('Error loading google map:', expect.any(Error));
 });

 // Test case to verify the json file value is set
 test('Set the JSON file text link ', async () => {
   // Mock json file link
   const mockData = { text: "https://www.google.com/maps/embed/v1/place?key=AIzaSyBqGkoHUfCA9LHCXbppnFagNsoR3M00XPc&q=Law+office+of+Eric+Schwab,Sacramento+CA" };
   fetch.mockResolvedValueOnce({
     json: jest.fn().mockResolvedValueOnce(mockData),
   });

   await loadMap();
   const iframe = document.getElementById("GMap");
   expect(iframe.src).toBe(mockData.text);
 });

 test('Verify fetch JSON from the correct file and link', async () => {
   // Mock json file link
   const mockData = { text: "https://www.google.com/maps/embed/v1/place?key=AIzaSyBqGkoHUfCA9LHCXbppnFagNsoR3M00XPc&q=Law+office+of+Eric+Schwab,Sacramento+CA" };
   fetch.mockResolvedValueOnce({
     json: jest.fn().mockResolvedValueOnce(mockData),
   });

   // DOMContentLoaded event
   document.dispatchEvent(new Event('DOMContentLoaded'));

   // Verify that fetch was called with the accurate text link
   expect(fetch).toHaveBeenCalledWith('/admin/content/index-map.json');
 });
});
