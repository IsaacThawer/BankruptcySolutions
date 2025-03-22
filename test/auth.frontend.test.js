/**
 * @jest-environment jsdom
 */

const { loginFailure, reloadPage } = require('../admin/js/auth');

describe('Frontend auth functions', () => {
  let mockTextField;

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="textField" />
      <div class="errorBox" style="display: none;"></div>
    `;
    localStorage.clear();
    mockTextField = document.getElementById('textField');
  });

  test('loginFailure updates text and shows error box', async () => {
    await loginFailure(mockTextField);
    expect(mockTextField.value).toBe('Login Failed: Incorrect Username or Password');
    expect(document.querySelector('.errorBox').style.display).toBe('block');
    expect(localStorage.getItem('failedAttempts')).toBe('1');
  });

  test('reloadPage triggers location.reload', () => {
    jest.useFakeTimers();

    // Workaround to override the reload function
    delete window.location;
    window.location = { reload: jest.fn() };

    reloadPage();
    jest.advanceTimersByTime(1000);

    expect(window.location.reload).toHaveBeenCalled();
  });
});
