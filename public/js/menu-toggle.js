document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const navbar = document.getElementById("navbar");
  // Toggle the 'active' class on the navbar when the menu button is clicked
  menuToggle.addEventListener("click", function () {
    navbar.classList.toggle("active");
  });
});
