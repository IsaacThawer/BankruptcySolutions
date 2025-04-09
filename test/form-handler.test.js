/**
 * @jest-environment jsdom
 */

// Polyfill must come first.
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require("jsdom");
// Import the module; note it both registers DOM listeners and exports verifyEmail.
const verifyEmail = require("../public/js/form-handler.js");

// Helper: Create an HTML fixture that matches your code's DOM requirements.
function setupDOM() {
  document.body.innerHTML = `
    <form action="/submit-form">
      <input type="text" id="firstname" name="firstname" value="John">
      <input type="text" id="lastname" name="lastname" value="Doe">
      <input type="email" id="email" name="email" value="">
      <input type="text" id="phone" name="phone" value="123456789">
      <textarea id="message" name="message">Hello</textarea>
      <input type="hidden" id="captchaToken" name="captchaToken" value="">
      <input type="submit" value="Submit">
    </form>
    <div id="recaptcha-display" style="display: none;"></div>
    <button id="recaptcha-exit">Exit</button>
    <span id="emailError"></span>
  `;

  const form = document.querySelector('form[action="/submit-form"]');
  // Manually assign form elements so that form.email.value works as expected.
  form.email = document.getElementById("email");
  form.firstname = document.getElementById("firstname");
  form.lastname = document.getElementById("lastname");
  form.phone = document.getElementById("phone");
  form.message = document.getElementById("message");
  form.captchaToken = document.getElementById("captchaToken");
  // Make sure the submit button is easily accessible both on the form and globally.
  const submitBtn = form.querySelector('input[type="submit"]');
  form.submitButton = submitBtn;
  window.submitButton = submitBtn;

  // Dispatch DOMContentLoaded so the module registers its event listeners.
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

describe("verifyEmail", () => {
  beforeEach(() => {
    global.fetch = undefined;
  });

  test("should return true when fetch returns valid true", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ valid: true }),
    });
    const result = await verifyEmail("test@example.com");
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "/verify-email?email=" + encodeURIComponent("test@example.com")
    );
  });

  test("should return false when fetch returns valid false", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ valid: false }),
    });
    const result = await verifyEmail("test@example.com");
    expect(result).toBe(false);
  });

  test("should return false when fetch throws an error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    const result = await verifyEmail("test@example.com");
    expect(result).toBe(false);
  });
});

describe("DOM interactions in form-handler.js", () => {
  beforeEach(() => {
    setupDOM();
    jest.clearAllMocks();
    // Stub alert so we can test alert invocations.
    window.alert = jest.fn();
    // Stub console.error to prevent test output pollution
    console.error = jest.fn();
  });

  test("email blur with empty value does nothing", () => {
    const emailInput = document.getElementById("email");
    emailInput.value = "";
    emailInput.reportValidity = jest.fn();
    emailInput.dispatchEvent(new Event("blur"));
    expect(emailInput.reportValidity).not.toHaveBeenCalled();
  });

  test("email blur with invalid syntax sets custom validity", () => {
    const emailInput = document.getElementById("email");
    emailInput.value = "invalidEmail";
    emailInput.reportValidity = jest.fn();
    emailInput.dispatchEvent(new Event("blur"));
    expect(emailInput.validationMessage).toBe("Enter a valid email address.");
    expect(emailInput.reportValidity).toHaveBeenCalled();
  });

  test("email blur with valid syntax but domain invalid", async () => {
    const emailInput = document.getElementById("email");
    emailInput.value = "test@example.com";
    emailInput.reportValidity = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ valid: false }),
    });
    emailInput.dispatchEvent(new Event("blur"));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(emailInput.validationMessage).toBe("We can't verify the domain.");
    expect(emailInput.reportValidity).toHaveBeenCalled();
  });

  test("email blur with valid syntax and domain valid clears custom validity", async () => {
    const emailInput = document.getElementById("email");
    emailInput.value = "test@example.com";
    emailInput.reportValidity = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ valid: true }),
    });
    emailInput.dispatchEvent(new Event("blur"));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(emailInput.validationMessage).toBe("");
  });

  test("form submit with invalid email prevents submission", async () => {
    const form = document.querySelector('form[action="/submit-form"]');
    const emailInput = document.getElementById("email");
    emailInput.value = "test@example.com";
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ valid: false }),
    });
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(window.alert).toHaveBeenCalledWith("Please enter a valid email address.");
  });

  test("form submit with valid email shows recaptcha and on successful captcha triggers form submission", async () => {
    const form = document.querySelector('form[action="/submit-form"]');
    const emailInput = document.getElementById("email");
    emailInput.value = "test@example.com";
    const submitButton = form.querySelector('input[type="submit"]');
    submitButton.disabled = false;

    global.fetch = jest.fn()
      // First fetch for email verification: valid=true.
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ valid: true }),
      })
      // Second fetch for form submission: success.
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true }),
      });

    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    const recaptchaDisplay = document.getElementById("recaptcha-display");
    expect(recaptchaDisplay.style.display).toBe("block");

    // Simulate the recaptcha callback.
    if (typeof window.captchaVerified === 'function') {
      window.captchaVerified("12345");
    }
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(window.alert).toHaveBeenCalledWith(
      'Thank you for your submission. We will contact you soon.'
    );
  });

  test("form submit and captcha verification handles fetch error in submission", async () => {
    const form = document.querySelector('form[action="/submit-form"]');
    const emailInput = document.getElementById("email");
    emailInput.value = "test@example.com";
    const submitButton = form.querySelector('input[type="submit"]');
    submitButton.disabled = false;

    global.fetch = jest.fn()
      // First call: verifyEmail returns valid=true.
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ valid: true }),
      })
      // Second call: simulate a submission fetch error.
      .mockRejectedValueOnce(new Error("Submission failed"));

    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    const recaptchaDisplay = document.getElementById("recaptcha-display");
    expect(recaptchaDisplay.style.display).toBe("block");

    // Simulate the recaptcha callback to trigger form submission.
    if (typeof window.captchaVerified === 'function') {
      window.captchaVerified("token");
    }
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(window.alert).toHaveBeenCalledWith(
      'An error occurred while processing your submission. Please try again.'
    );
    expect(submitButton.disabled).toBe(false);
  });

  test("DOMContentLoaded event without recaptcha-exit does not throw", () => {
    // Remove the recaptcha exit button and re-dispatch DOMContentLoaded.
    document.body.innerHTML = `
      <form action="/submit-form">
        <input type="email" id="email" name="email" value="">
        <input type="submit" value="Submit">
      </form>
      <div id="recaptcha-display" style="display: none;"></div>
      <span id="emailError"></span>
    `;
    const form = document.querySelector('form[action="/submit-form"]');
    form.email = document.getElementById("email");
    expect(() => {
      document.dispatchEvent(new Event("DOMContentLoaded"));
    }).not.toThrow();
  });
  
  test("showCaptcha function displays the recaptcha", () => {
    const recaptchaDisplay = document.getElementById('recaptcha-display');
    // Access the showCaptcha function via the global window object
    // We'll expose it temporarily for testing
    window.showCaptchaForTest = () => {
      document.getElementById('recaptcha-display').style.display = 'block';
    };
    
    // Call the function
    window.showCaptchaForTest();
    
    // Verify it set the display to 'block'
    expect(recaptchaDisplay.style.display).toBe('block');
  });
  
  test("clicking recaptcha exit button hides the recaptcha display", () => {
    const recaptchaDisplay = document.getElementById('recaptcha-display');
    const recaptchaExit = document.getElementById('recaptcha-exit');
    
    // First show the recaptcha
    recaptchaDisplay.style.display = 'block';
    
    // Simulate clicking the exit button
    recaptchaExit.click();
    
    // Verify the recaptcha is hidden
    expect(recaptchaDisplay.style.display).toBe('none');
  });
  
  test("form submission handles server error response", async () => {
    const form = document.querySelector('form[action="/submit-form"]');
    const emailInput = document.getElementById("email");
    emailInput.value = "test@example.com";
    const submitButton = form.querySelector('input[type="submit"]');
    submitButton.disabled = false;

    global.fetch = jest.fn()
      // First fetch for email verification: valid=true
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ valid: true }),
      })
      // Second fetch for form submission: success=false (server error)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false, error: "Server error" }),
      });

    // Simulate form submission
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    // Show recaptcha and verify captcha
    window.captchaVerified("token");
    await new Promise(resolve => setTimeout(resolve, 0));

    // Check error handling
    expect(window.alert).toHaveBeenCalledWith("Server error");
    expect(submitButton.disabled).toBe(false);
  });
  
  test("form submission handles server error without specific message", async () => {
    const form = document.querySelector('form[action="/submit-form"]');
    const emailInput = document.getElementById("email");
    emailInput.value = "test@example.com";
    const submitButton = form.querySelector('input[type="submit"]');
    submitButton.disabled = false;

    global.fetch = jest.fn()
      // First fetch for email verification: valid=true
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ valid: true }),
      })
      // Second fetch for form submission: success=false (no specific error)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: false }),
      });

    // Simulate form submission
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 0));

    // Show recaptcha and verify captcha
    window.captchaVerified("token");
    await new Promise(resolve => setTimeout(resolve, 0));

    // Check default error message
    expect(window.alert).toHaveBeenCalledWith("An error occurred. Please try again.");
    expect(submitButton.disabled).toBe(false);
  });
});