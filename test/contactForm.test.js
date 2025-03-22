/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const { screen, fireEvent } = require('@testing-library/react');

document.body.innerHTML = `
  <section class="send-text">
    <p>Free Consultation</p>
  </section>

  <p style="text-align: center; width: 100%; max-width: 892px; padding: 10px; margin: 0 auto;">
    Use the form below to contact us regarding your legal inquiry. Please be as detailed as possible. However, please do not include any confidential or sensitive information. 
  </p>

  <form action="/submit-form" method="POST" id="contact-form" data-testid="contact-form">
    <div class="name-row">
      <div>
        <label for="firstname">First Name:</label> <small>(Required)</small><br>
        <input type="text" id="firstname" name="firstname" maxlength="25" required>
      </div>
      <div>
        <label for="lastname">Last Name:</label> <small>(Required)</small><br>
        <input type="text" id="lastname" name="lastname" maxlength="25" required>
      </div>
    </div><br>

    <label for="email">Email Address:</label> <small>(Required)</small><br>
    <input type="email" id="email" name="email" required><br><br>

    <label for="phone">Phone Number:</label><small> Example: (123)-456-7890</small><br>
    <input type="tel" id="phone" name="phone" pattern="^(?:\\(\\d{3}\\)|\\d{3})-?\\d{3}-?\\d{4}$" required><br><br>

    <label for="message">How Can We Help?</label><br>
    <textarea id="message" name="message" maxlength="250" required></textarea><br><br>
    
    <input type="hidden" id="captchaToken" name="captchaToken" value="">
    <input type="submit" value="Submit">
  </form>
`;

describe('Contact Form', () => {
  test('renders the form with all required fields', () => {
    expect(screen.getByText('Free Consultation')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address:')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number:')).toBeInTheDocument();
    expect(screen.getByLabelText('How Can We Help?')).toBeInTheDocument();
  });

  test('does not submit form when required fields are empty', () => {
    const form = screen.getByTestId('contact-form');
    const submitButton = screen.getByText('Submit');

    fireEvent.click(submitButton);

    expect(form.checkValidity()).toBe(false);
  });

  test('submits the form when valid data is entered', () => {
    fireEvent.input(screen.getByLabelText('First Name:'), { target: { value: 'John' } });
    fireEvent.input(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } });
    fireEvent.input(screen.getByLabelText('Email Address:'), { target: { value: 'john.doe@example.com' } });
    fireEvent.input(screen.getByLabelText('Phone Number:'), { target: { value: '(123)-456-7890' } });
    fireEvent.input(screen.getByLabelText('How Can We Help?'), { target: { value: 'I need help with my debt settlement.' } });

    const form = screen.getByTestId('contact-form');
    expect(form.checkValidity()).toBe(true);

    fireEvent.submit(form);
  });
});
