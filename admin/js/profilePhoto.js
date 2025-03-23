document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById('profilePicInput');
  const profilePic = document.getElementById('profilePic');

  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const base64 = e.target.result;
        profilePic.src = base64;
        localStorage.setItem('profileImage', base64);
      };

      reader.readAsDataURL(file);
    }
  });

  // Load saved image on page load
  const savedImage = localStorage.getItem('profileImage');
  if (savedImage) {
    profilePic.src = savedImage;
  }
});
