// test for functions inside read-script and save-script for reading and loading .JSON files

// DIRECT FUNCTION TESTS

// Instead of importing at the top level, we wrap these in a beforeAll so that the module is imported after setup.
let saveText, loadText, updateServiceDescription;
beforeAll(() => {
  // Import functions for direct testing.
  // (Ensure that read-script.js defines loadText before exporting it.)
  saveText = require('../admin/js/write-script'); // assumed default export (a function)
  ({ loadText, updateServiceDescription } = require('../admin/js/read-script'));
});

beforeEach(() => {
  // Reset mocks and clear the DOM for direct tests.
  global.fetch = jest.fn();
  document.body.innerHTML = "";
  jest.restoreAllMocks();
});

// Test: loadText sets element innerHTML correctly 
test("loadText sets element innerHTML correctly", async () => {
  document.body.innerHTML = '<div id="test-element"></div>';
  global.fetch.mockResolvedValue({
    json: () => Promise.resolve({ text: "Hello world" })
  });
  await loadText("test-element", "dummy.json");
  expect(document.getElementById("test-element").innerHTML).toBe("Hello world");
});

// Test: loadText handles fetch failure gracefully
test("loadText handles fetch failure gracefully", async () => {
  document.body.innerHTML = '<div id="test-element"></div>';
  global.fetch.mockRejectedValue(new Error("Network Error"));
  await expect(loadText("test-element", "dummy.json")).rejects.toThrow("Network Error");
  expect(document.getElementById("test-element").innerHTML).toBe("");
});

// Test: saveText sends POST request and alerts response 
test("saveText sends POST request and alerts response", async () => {
  document.body.innerHTML = `<input id="test-input" value="Test content" />`;
  global.fetch.mockResolvedValue({
    text: () => Promise.resolve("File saved")
  });
  global.alert = jest.fn();
  await saveText("test-input", "dummy.json");
  expect(global.fetch).toHaveBeenCalledWith('/admin/content/dummy.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'text=' + encodeURIComponent("Test content"),
  });
  expect(global.alert).toHaveBeenCalledWith("File saved");
});

// Test: saveText handles fetch failure gracefully
test("saveText handles fetch failure gracefully", async () => {
  document.body.innerHTML = `<input id="test-input" value="Test content" />`;
  global.fetch.mockRejectedValue(new Error("Network Error"));
  global.alert = jest.fn();
  await expect(saveText("test-input", "dummy.json")).rejects.toThrow("Network Error");
  expect(global.alert).not.toHaveBeenCalled();
});

// Test: updateServiceDescription updates service description text correctly
test("updateServiceDescription updates service description text correctly", async () => {
  document.body.innerHTML = '<p id="servicesChapter7"></p>';
  global.fetch.mockResolvedValue({
    text: () => Promise.resolve("Updated Service Description")
  });
  await updateServiceDescription("Chapter7");
  expect(document.getElementById("servicesChapter7").innerText).toBe("Updated Service Description");
});

// Test: updateServiceDescription does nothing if element does not exist
test("updateServiceDescription does nothing if element does not exist", async () => {
  document.body.innerHTML = "";
  global.fetch = jest.fn();
  await updateServiceDescription("Chapter7");
  expect(global.fetch).not.toHaveBeenCalled();
});

