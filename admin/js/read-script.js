
async function loadText(contID, filename) {
    const response = await fetch(`/admin/content/${filename}`, {
        method: 'GET',
    }); // load from server
    const text = await response.text();
    document.getElementById(contID).innerHTML = text;
}


window.addEventListener('DOMContentLoaded', loadText('home-page-title', 'index-title.txt'));
window.addEventListener('DOMContentLoaded', loadText('home-page-description', 'index-description.txt'));
window.addEventListener('DOMContentLoaded', loadText('home-page-contactInfo', 'index-contact.txt'));
window.addEventListener('DOMContentLoaded', loadText('home-page-services', 'index-services.txt'));
window.addEventListener('DOMContentLoaded', loadText('home-page-reviews', 'index-reviews.txt'));

window.addEventListener('DOMContentLoaded', loadText('reviews-header', 'reviews-header.txt'));
window.addEventListener('DOMContentLoaded', loadText('review1', 'review1.txt'));
window.addEventListener('DOMContentLoaded', loadText('review2', 'review2.txt'));
window.addEventListener('DOMContentLoaded', loadText('review3', 'review3.txt'));

window.addEventListener('DOMContentLoaded', loadText('services-Chapter7', 'services-Chapter7.txt'));
window.addEventListener('DOMContentLoaded', loadText('services-Chapter11', 'services-Chapter11.txt'));
window.addEventListener('DOMContentLoaded', loadText('services-Chapter12', 'services-Chapter12.txt'));
window.addEventListener('DOMContentLoaded', loadText('services-Chapter13', 'services-Chapter13.txt'));
window.addEventListener('DOMContentLoaded', loadText('service-benefits', 'service-benefits.txt'));
window.addEventListener('DOMContentLoaded', loadText('why-choose-us', 'why-choose-us.txt'));
