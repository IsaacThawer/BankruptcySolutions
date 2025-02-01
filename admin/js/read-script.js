
async function loadText(contID, filename) {
    const response = await fetch(`/admin/content/${filename}`, {
        method: 'GET',
    }); // load from server
    const text = await response.text();
    document.getElementById(contID).textContent = text;
}


window.addEventListener('DOMContentLoaded', loadText('home-page-title', 'index-title.txt'));
window.addEventListener('DOMContentLoaded', loadText('home-page-description', 'index-description.txt'));
window.addEventListener('DOMContentLoaded', loadText('home-page-contactInfo', 'index-contact.txt'));
window.addEventListener('DOMContentLoaded', loadText('home-page-services', 'index-services.txt'));
window.addEventListener('DOMContentLoaded', loadText('home-page-reviews', 'index-reviews.txt'));

