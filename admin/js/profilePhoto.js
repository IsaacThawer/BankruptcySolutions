// profilePhoto.js
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById('profilePicInput');
  const profilePic = document.getElementById('profilePic');

  if (!fileInput || !profilePic) return;

  fileInput.addEventListener('change', function () {
    const file = this.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const base64 = e?.target?.result;
      if (!base64 || typeof base64 !== 'string') return;

      profilePic.src = base64;
      try {
        localStorage.setItem('profileImage', base64);
      } catch (err) {
        console.error('Failed to save image to localStorage:', err);
      }
    };

    reader.readAsDataURL(file);
  });

  try {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage && typeof savedImage === 'string') {
      profilePic.src = savedImage;
    }
  } catch (err) {
    console.error('Failed to load image from localStorage:', err);
  }
});
