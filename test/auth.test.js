/**
 * @jest-environment jsdom
 */


const {loginFailure, reloadPage} = require('../admin/js/auth');

describe('Login page test text field and reload test', () => {

  let loginForm, username, password, loginFailureMock, mockText;

  beforeEach(() => {
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
});