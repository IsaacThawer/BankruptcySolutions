async function saveText(contID, filename) {
    const newText = document.getElementById(contID).value;

    const response = await fetch(`/admin/content/${filename}`, { // Save to server
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'text=' + encodeURIComponent(newText),
    });

    const result = await response.text();
    alert(result);
}

// Export saveText for Jest testing
if (typeof module !== 'undefined' && module.exports) {
    window.saveText = saveText;
    module.exports = saveText;
  }