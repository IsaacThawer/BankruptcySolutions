document.addEventListener("DOMContentLoaded", function () {
  initPublicNav();
});

async function initPublicNav () {
  const menuToggle = document.getElementById("menuToggle");
  const navbar = document.getElementById("navbar");
  // Toggle the 'active' class on the navbar when the menu button is clicked
  menuToggle.addEventListener("click", function () {
    navbar.classList.toggle("active");
  });
}


module.exports = { initPublicNav}