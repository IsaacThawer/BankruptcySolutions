const { screen, fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');


document.body.innerHTML = `
  <div class="logout">
    <img src="/admin/images/Logout.png" alt="Logout Icon" class="logout-icon">
    <button id="logout-button"  data-testid="logout-sign-out-button" >Sign Out</button>
  </div>


    <div class="container">
    <div class="header-buttons">
      <!-- Navigation buttons -->
      <button id="logout-button" onclick="window.location.href='/logout'">Sign Out</button>
      <button id="back-button" data-testid="container-sign-out-button" onclick="window.location.href='dashboard.html'">Back to Main Page</button>
    </div>
  </div>
`;

describe('Sign out and Back to main page tests', () => {  

test('Dashboard Sign Out button redirects to login page  when clicked', () => {
const buttons = screen.queryAllByText('Sign Out');
const signOutButton = buttons[0];

  delete window.location;
  window.location = { href: jest.fn() };

  // eventListener for a click 
  signOutButton.addEventListener('click', () => {
    window.location.href = 'admin/login.html';
  });

// use fireEvent library to simulate a click
  fireEvent.click(signOutButton);

  // expects the path to be the login page 
  expect(window.location.href).toBe('admin/login.html');
});


test(' Back to Main Page button redirects to dashboard.html when licked', () => {
    const backButton = screen.getByText('Back to Main Page');

    delete window.location;
    window.location = { href: jest.fn() };

    //event listener for the clicks 
    backButton.addEventListener('click', () => {
        window.location.href = 'admin/dashboard.html';
      });

      // simulates a click 
    fireEvent.click(backButton);

    // expects the path to be the login page 
    expect(window.location.href).toBe('admin/dashboard.html');
} )

})