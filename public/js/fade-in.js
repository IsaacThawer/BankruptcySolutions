async function checkVisibility() {
    const fadeInSections = document.querySelectorAll(".fade-in-section");
    fadeInSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            section.classList.add("visible");
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // Initial check on page load
  checkVisibility();

  // Listen for scroll events
  window.addEventListener("scroll", checkVisibility);
});
module.exports = {checkVisibility}
