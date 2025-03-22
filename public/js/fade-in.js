document.addEventListener("DOMContentLoaded", function () {
  const fadeInSections = document.querySelectorAll(".fade-in-section");

  function checkVisibility() {
      fadeInSections.forEach(section => {
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85) {
              section.classList.add("visible");
          }
      });
  }

  // Initial check on page load
  checkVisibility();

  // Listen for scroll events
  window.addEventListener("scroll", checkVisibility);
});
