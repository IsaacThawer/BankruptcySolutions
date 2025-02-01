async function loadText(contID, filename) {
    const response = await fetch(`/admin/content/${filename}`, {
        method: 'GET',
    }); // load from server
    const text = await response.text();
    document.getElementById(contID).textContent = text;
}

window.addEventListener('DOMContentLoaded', loadText('introduction', 'index-description.txt'));
window.addEventListener('DOMContentLoaded', loadText('title', 'index-title.txt'));
window.addEventListener('DOMContentLoaded', loadText('contact', 'index-contact.txt'));
window.addEventListener('DOMContentLoaded', loadText('services1', 'index-services.txt'));
window.addEventListener('DOMContentLoaded', loadText('review1', 'index-reviews.txt'));
