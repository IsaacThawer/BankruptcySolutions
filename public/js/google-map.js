async function loadMap() {
  try{
      const response = await fetch("/admin/content/index-map.json");
      const data = await response.json();
      document.getElementById("GMap").src = data.text;
  } catch (error) {
      console.error("Error loading google map:", error);
  }
 }
 document.addEventListener("DOMContentLoaded", function() {
  loadMap();
 });
 module.exports = {loadMap}