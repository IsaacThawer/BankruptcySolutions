/**
* @jest-environmnet jsdom
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

    // Mock reload
    Object.defineProperty(window, 'location', {
      value: {
        reload: jest.fn(),
      },
    });

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
});