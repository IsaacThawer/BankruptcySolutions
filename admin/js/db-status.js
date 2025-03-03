document.addEventListener("DOMContentLoaded", () => {
  fetch("/test-db")  // Ensure this matches the correct API route
    .then(response => response.json())
    .then(data => {
      console.log("API Response:", data); // Debugging log
      const statusText = document.getElementById("db-status-text");
      const statusDiv = document.getElementById("db-status");

      if (data.success) {
        statusText.textContent = "Connected ✅";
        statusDiv.classList.add("connected");
      } else {
        statusText.textContent = "Disconnected ❌";
        statusDiv.classList.add("disconnected");
      }
    })
    .catch(error => {
      console.error("Error checking database status:", error);
      document.getElementById("db-status-text").textContent = "Error ❌";
    });
});
