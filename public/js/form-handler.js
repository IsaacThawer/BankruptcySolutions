
document.addEventListener('DOMContentLoaded', () => {
  //Email verification function that calls the /verify-email endpoint
  async function verifyEmail(email) {
    try {
      const response = await fetch('/verify-email?email=' + encodeURIComponent(email));
      const data = await response.json();
      return data.valid;
    } catch (error) {
        console.error("Error verifying email:", error);
        return false;
    }
  } 
  
  // Get references to form and email elements
  const form = document.querySelector('form[action="/submit-form"]');
  const emailInput = document.getElementById("email");
  const emailErrorSpan = document.getElementById("emailError");

   // Add blur event listener to the email input for real-time verification
   if (emailInput) {
    emailInput.addEventListener("blur", async function() {
      // 1) Clear any existing custom error
      this.setCustomValidity("");
      
      // 2) If the user left it blank or something, let the browser handle "required" rules
      if (!this.value) {
        // If empty, do nothing; browser handles "required"
        return;
      }

      // 3) Check basic HTML5 email syntax. If it fails, the browser shows 
      //    "Please include an '@' in the email address." 
      //    extra check to display unify message
      const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!basicEmailRegex.test(this.value)) {
        // Syntax is invalid (missing "@" or ".")
        this.setCustomValidity("Enter a valid email address.");
        this.reportValidity();
        return;
      }

      // 4) Syntax is okay => check domain with server
      const domainIsValid = await verifyEmail(this.value);
      if (!domainIsValid) {
        // Domain doesn't have MX records or DNS failed
        this.setCustomValidity("We can't verify the domain.");
        this.reportValidity();
      } else {
        // Everything looks good
        this.setCustomValidity("");
      }
    });
  }

  //Form submission event listener now includes email verification
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      //Verify email before proceeding with submission
      const email = form.email.value;
      const emailIsValid = await verifyEmail(email);
      if (!emailIsValid) {
      alert("Please enter a valid email address.");
      return; // Stop submission if email is not valid
     }
      
      const submitButton = form.querySelector('input[type="submit"]');
      submitButton.disabled = true;
      
      try {
          const formData = {
              firstname: form.firstname.value,
              lastname: form.lastname.value,
              email: form.email.value,
              phone: form.phone.value,
              message: form.message.value
          };

          const response = await fetch('/submit-form', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
          });

          const result = await response.json();

          if (result.success) {
              alert('Thank you for your submission. We will contact you soon.');
              form.reset();
          } else {
              alert(result.error || 'An error occurred. Please try again.');
          }
      } catch (error) {
          console.error('Submission error:', error);
          alert('An error occurred while processing your submission. Please try again.');
      } finally {
          submitButton.disabled = false;
      }
    });
  }
});