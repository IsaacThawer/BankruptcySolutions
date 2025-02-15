// Create this as public/js/form-handler.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[action="/submit-form"]');
  
  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
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
});