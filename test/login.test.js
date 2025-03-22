/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const { screen, fireEvent } = require('@testing-library/react');

// Mock the DOM content loading and include your auth.js logic
document.body.innerHTML = `
  <div class="login-container">
    <div class="login-card">
      <div class="welcome-side">
        <h1>Welcome</h1>
      </div>
      <div class="login-side">
        <h2>Login</h2>
        <form id="login-form">
          <div class="login-form-group">
            <label for="username">Username</label>
            <input type="text" id="username" required>
          </div>
          <div class="login-form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required> 
            <input type="checkbox" id="checkboxInput" data-testid="checkboxInput" style="visibility: visible;"> 
            <div class="toggleContainer">
              <label class="toggleSwitch" for="checkboxInput"></label>
              <span class="toggleText">Show Password</span>
            </div>
            <div class="errorBox">
              <input type="text" id="textField" readonly style="display: none;">
            </div>
          </div>
          <div class="login-button-group">
            <button type="submit" class="login-button">Submit</button>
            <a href="https://example.com/forgotPassword" id="forgot-password" class="login-button">Forgot Password</a>
          </div>
        </form>
      </div>
    </div>
  </div>
`;

// Add the auth.js code to your test setup to ensure the toggle logic runs
document.addEventListener("DOMContentLoaded", function() {

  const toggleCheckbox = document.getElementById('checkboxInput');
  const passwordField = document.getElementById('password');
  const toggleText = document.querySelector('.toggleText');

  toggleCheckbox.addEventListener('change', function() {
    if (this.checked) {
      passwordField.type = 'text';
      toggleText.textContent = 'Hide Password';
    } else {
      passwordField.type = 'password';
      toggleText.textContent = 'Show Password';
    }
  });
});

// Manually trigger the DOMContentLoaded event to execute the script
document.dispatchEvent(new Event('DOMContentLoaded'));

describe('Login Form', () => {
  test('renders username and password fields', () => {
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  test('allows input of valid username and password', () => {
    fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'testpassword' } });

    expect(screen.getByLabelText('Username').value).toBe('testuser');
    expect(screen.getByLabelText('Password').value).toBe('testpassword');
  });

  test('shows and hides password when the toggle is clicked', () => {
    const passwordInput = screen.getByLabelText('Password');
    const toggleText = screen.getByText('Show Password');

    // Initially, password is hidden
    expect(passwordInput.type).toBe('password'); // Expect the initial type to be 'password'

    // Get the checkbox directly
    const checkbox = screen.getByTestId('checkboxInput');

    // First, simulate a change to the checkbox to show the password
    fireEvent.change(checkbox, { target: { checked: true } });

    // After clicking, password should be visible
    expect(passwordInput.type).toBe('text');  // Expect the type to change to 'text'

    // Update the span text (Show Password => Hide Password)
    expect(toggleText.textContent).toBe('Hide Password'); // Ensure the text changes to 'Hide Password'

    // Simulate unchecking the checkbox to hide the password
    fireEvent.change(checkbox, { target: { checked: false } });

    // After unchecking, password should be hidden
    expect(passwordInput.type).toBe('password');  // Expect the type to change back to 'password'

    // Update the span text again (Hide Password => Show Password)
    expect(toggleText.textContent).toBe('Show Password');
  });  
});
