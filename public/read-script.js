async function loadText(contID, filename) {
    const response = await fetch(`/admin/content/${filename}`, {
        method: 'GET',
    }); // load from server
    const text = await response.text();
    document.getElementById(contID).innerHTML = text;
}

window.addEventListener('DOMContentLoaded', loadText('introduction', 'index-description.txt'));
window.addEventListener('DOMContentLoaded', loadText('title', 'index-title.txt'));
window.addEventListener('DOMContentLoaded', loadText('contact', 'index-contact.txt'));
window.addEventListener('DOMContentLoaded', loadText('services1', 'index-services.txt'));
window.addEventListener('DOMContentLoaded', loadText('review1', 'index-reviews.txt'));

// Load reviews page content
window.addEventListener('DOMContentLoaded', loadText('reviews-page-title', 'reviews-title.txt'));
window.addEventListener('DOMContentLoaded', loadText('review1-content', 'review1.txt'));
window.addEventListener('DOMContentLoaded', loadText('review2-content', 'review2.txt'));
window.addEventListener('DOMContentLoaded', loadText('review3-content', 'review3.txt'));