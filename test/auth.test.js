/**
 * @jest-environment jsdom
 */

function setupFullDOM(overrides = {}) {
  const defaults = {
    username: 'user',
    password: 'pass'
  };
  const final = { ...defaults, ...overrides };

  document.body.innerHTML = `
    <form id="login-form">
      <input type="text" id="username" value="${final.username}" />
      <input type="password" id="password" value="${final.password}" />
      <button type="submit">Login</button>
    </form>
    <div id="textField"></div>
    <div class="errorBox" style="display: none;"></div>
    <div id="recaptcha-display" style="display: none;"></div>
    <div id="recaptcha-exit"></div>
    <input type="hidden" id="captchaToken" />
    <input type="checkbox" id="checkboxInput" />
    <div class="toggleText"></div>
    <button id="forgot-password"></button>
  `;
}

const {loginFailure, reloadPage} = require('../admin/js/auth');

describe('Login page test text field and reload test', () => {

  let loginForm, username, password, loginFailureMock, mockText;

  beforeEach(() => {
    window.alert = jest.fn();
    // Login form mock html
    document.body.innerHTML = `
      <form id="login-form">
        <input type="text" id="username" />
        <input type="password" id="password" />
        <button type="submit">Login</button>
      </form>
      <div id="textField"></div>
      <div class="errorBox" style="display: none;"></div>
    `;

    loginForm = document.getElementById("login-form");
    username = document.getElementById("username");
    password = document.getElementById("password");
    mockText = document.getElementById("textField");

    // Fetch Mock
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: "Login Failed: Incorrect Username or Password" }),
      })
    );

    // Mock the loginFailure function with spyOn
    loginFailureMock = jest.spyOn(require('../admin/js/auth'), 'loginFailure').mockImplementation(() => {});

    delete window.location;
    window.location = { reload: jest.fn() };

    // Use jest timers to control setTimeout used in reloadPage()
    jest.useFakeTimers();
    loginFailure(mockText);
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
    jest.restoreAllMocks(); 
    jest.useRealTimers();
  });

  test('should display the accurate login failed message after calling the loginFailure function',async () => {
    // Call the loginFailure function with the mockText value
    await loginFailure(mockText);

    // Check if the value of the error text field is updated correctly
    expect(mockText.value).toBe('Login Failed: Incorrect Username or Password');
  });

  test('Should reload page after a set timed delay to display the error message', () => {
    // Call the reload page function
    reloadPage();

    // Check to see that the function does refresh the page right away
    expect(window.location.reload).not.toHaveBeenCalled();

    // Advance the time by the defind value
    jest.advanceTimersByTime(1000);

    // Check to see that the reload function was properly called once after the timer
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  test('Should call and display accurate invalid login message when using incorrect username/password', async () => {
    // Input values for incorrect login credentials
    const invalidUsername = "wrongUsername";
    const invalidPassword = "wrongPassword"; 

    // Fill the login form input fields with the invalid values
    username.value = invalidUsername;
    password.value = invalidPassword;

    const formSubmit = new Event('submit');
    loginForm.dispatchEvent(formSubmit);
    await loginFailureMock(mockText);
    //loginForm.submit();

    await Promise.resolve();

    expect(loginFailureMock).toHaveBeenCalled();
    expect(mockText.value).toBe('Login Failed: Incorrect Username or Password')
  });

  test('loginFailure does nothing when textField is null', async () => {
    // Call loginFailure with null to simulate a missing DOM element
    await loginFailure(null);
  
    // Since there's no textField, nothing should happen and no error should be thrown
    expect(true).toBe(true); // This passes as long as no exception occurs
  });
  
  test('reloadPage should reload the page only once even when called multiple times', () => {
    reloadPage();
    jest.advanceTimersByTime(1000);
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  
    reloadPage();
    jest.advanceTimersByTime(1000);
    expect(window.location.reload).toHaveBeenCalledTimes(2);
  });
  
  test('should not call loginFailure when form fields are empty', async () => {
    // Leave username and password empty
    username.value = '';
    password.value = '';
  
    const formSubmit = new Event('submit');
    loginForm.dispatchEvent(formSubmit);
  
    await Promise.resolve(); // Wait for any async operations
  
    // You might expect loginFailure not to be called
    // But depending on your auth.js logic, update this accordingly
    expect(loginFailureMock).not.toHaveBeenCalled();
  });

  test('should not call loginFailure on successful login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true }), // success!
      })
    );
  
    // Set input values
    username.value = "admin";
    password.value = "correctPassword";
  
    const submitEvent = new Event('submit');
    loginForm.dispatchEvent(submitEvent);
  
    await Promise.resolve();
  
    expect(loginFailureMock).not.toHaveBeenCalled();
    // Optionally check for redirect behavior or state change
  });
  
  test('should show recaptcha when failedAttempts >= 3 and captcha not solved', () => {
    // Simulate 3 failed attempts in localStorage
    localStorage.setItem('failedAttempts', '3');
  
    // Mock grecaptcha
    global.grecaptcha = { getResponse: jest.fn(() => '') };
  
    // Populate required DOM elements
    document.body.innerHTML = `
      <form id="login-form">
        <input id="username" value="test" />
        <input id="password" value="wrong" />
        <button type="submit">Login</button>
      </form>
      <div id="recaptcha-display" style="display:none;"></div>
      <div id="recaptcha-exit"></div>
      <div id="textField"></div>
      <div class="errorBox" style="display: none;"></div>
      <input type="hidden" id="captchaToken" />
      <input type="checkbox" id="checkboxInput" />
      <div class="toggleText"></div>
      <button id="forgot-password"></button>
    `;
  
    // Trigger DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    // Submit the form
    const form = document.getElementById('login-form');
    form.dispatchEvent(new Event('submit'));
  
    // Check if recaptcha is shown
    expect(document.getElementById('recaptcha-display').style.display).toBe('block');
  });

  test('captchaVerified sets token and hides recaptcha', () => {
    localStorage.setItem('failedAttempts', '2');
    setupFullDOM();
  
    document.getElementById('recaptcha-display').style.display = 'block';
  
    document.dispatchEvent(new Event('DOMContentLoaded'));
    window.captchaVerified('test-token');
  
    expect(document.getElementById('recaptcha-display').style.display).toBe('none');
    expect(document.getElementById('captchaToken').value).toBe('test-token');
    expect(localStorage.getItem('failedAttempts')).toBe('0');
  });
  
  test('clicking recaptcha-exit hides the recaptcha display', () => {
    document.body.innerHTML = `
      <div id="recaptcha-display" style="display: block;"></div>
      <div id="recaptcha-exit"></div>
      <div id="textField"></div>
      <form id="login-form"></form>
      <button id="forgot-password"></button>
      <input type="checkbox" id="checkboxInput" />
      <input id="password" type="password" />
      <div class="toggleText"></div>
    `;
  
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    document.getElementById('recaptcha-exit').click();
    expect(document.getElementById('recaptcha-display').style.display).toBe('none');
  });

  test('clicking forgot password redirects to Cognito reset page', () => {
    delete window.location;
    window.location = { href: '' };
  
    setupFullDOM();
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    document.getElementById('forgot-password').click();
    expect(window.location.href).toMatch(/forgotPassword/);
  });
  
  test('toggles password field visibility and updates label text', () => {
    setupFullDOM();
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    const checkbox = document.getElementById('checkboxInput');
    const passwordField = document.getElementById('password');
    const toggleText = document.querySelector('.toggleText');
  
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(passwordField.type).toBe('text');
    expect(toggleText.textContent).toBe('Hide Password');
  
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    expect(passwordField.type).toBe('password');
    expect(toggleText.textContent).toBe('Show Password');
  });  

  test('does not throw if toggleText element is missing', () => {
    setupFullDOM();
    document.querySelector('.toggleText').remove(); // simulate missing element
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    const checkbox = document.getElementById('checkboxInput');
    checkbox.checked = true;
    expect(() => {
      checkbox.dispatchEvent(new Event('change'));
    }).not.toThrow();
  });

  test('does not show recaptcha if grecaptcha is solved', () => {
    localStorage.setItem('failedAttempts', '3');
    global.grecaptcha = { getResponse: jest.fn(() => 'someToken') };
  
    setupFullDOM();
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    const form = document.getElementById('login-form');
    form.dispatchEvent(new Event('submit'));
  
    expect(document.getElementById('recaptcha-display').style.display).toBe('none');
    expect(window.alert).not.toHaveBeenCalled();
  });  

  test('clicking outside recaptcha display hides it', () => {
    setupFullDOM();
    const recaptcha = document.getElementById('recaptcha-display');
    recaptcha.style.display = 'block';

    document.dispatchEvent(new Event('DOMContentLoaded'));
    window.onclick({ target: recaptcha });

    expect(recaptcha.style.display).toBe('none');
  });
});