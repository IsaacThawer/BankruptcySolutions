async function loadText(contID, filename) {
    const response = await fetch(`/admin/content/${filename}`, {
        method: 'GET',
    }); // load from server
    const dataText = await response.json();// Parse the json response
    document.getElementById(contID).innerHTML = dataText.text;//Display only the text property
}

window.addEventListener('DOMContentLoaded', loadText('introduction', 'index-description.json'));
window.addEventListener('DOMContentLoaded', loadText('title', 'index-title.json'));
window.addEventListener('DOMContentLoaded', loadText('contact', 'index-contact.json'));
window.addEventListener('DOMContentLoaded', loadText('services1', 'index-services.json'));
window.addEventListener('DOMContentLoaded', loadText('review1', 'index-reviews.json'));

window.addEventListener('DOMContentLoaded', loadText('reviews-header', 'reviews-header.json'));
window.addEventListener('DOMContentLoaded', loadText('review1', 'review1.json'));
window.addEventListener('DOMContentLoaded', loadText('review2', 'review2.json'));
window.addEventListener('DOMContentLoaded', loadText('review3', 'review3.json'));

window.addEventListener('DOMContentLoaded', loadText('g-review1', 'g-review1.json'));

window.addEventListener('DOMContentLoaded', loadText('services-Chapter7', 'services-Chapter7.json'));
window.addEventListener('DOMContentLoaded', loadText('services-Chapter11', 'services-Chapter11.json'));
window.addEventListener('DOMContentLoaded', loadText('services-Chapter12', 'services-Chapter12.json'));
window.addEventListener('DOMContentLoaded', loadText('services-Chapter13', 'services-Chapter13.json'));
window.addEventListener('DOMContentLoaded', loadText('service-benefits', 'service-benefits.json'));
window.addEventListener('DOMContentLoaded', loadText('why-choose-us', 'why-choose-us.json'));

window.addEventListener('DOMContentLoaded', loadText('about-us', 'about-us.json'));
window.addEventListener('DOMContentLoaded', loadText('about-meet-eric', 'about-meet-eric.json'));
window.addEventListener('DOMContentLoaded', loadText('about-erics-role', 'about-erics-role.json'));
window.addEventListener('DOMContentLoaded', loadText('about-education', 'about-education.json'));
window.addEventListener('DOMContentLoaded', loadText('about-client-commitment', 'about-client-commitment.json'));
