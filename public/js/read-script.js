// read-script.js

async function loadText(contID, filename) {
    const response = await fetch(`/admin/content/${filename}`, {
        method: 'GET',
    });
    const dataText = await response.json();
    document.getElementById(contID).innerHTML = dataText.text;
}

// Export for Node environments
try {
    module.exports = { loadText, initLoadText };
} catch (e) {
    // Ignore if module is undefined (e.g. in browser)
}


function initLoadText() {
    loadText('introduction', 'index-description.json');
    loadText('title', 'index-title.json');
    loadText('contact', 'index-contact.json');
    loadText('services1', 'index-services.json');
    loadText('review1', 'index-reviews.json');
    loadText('reviews-header', 'reviews-header.json');
    loadText('review1', 'review1.json');
    loadText('review2', 'review2.json');
    loadText('review3', 'review3.json');
    loadText('g-review1', 'g-review1.json');
    loadText('services-Chapter7', 'services-Chapter7.json');
    loadText('services-Chapter11', 'services-Chapter11.json');
    loadText('services-Chapter12', 'services-Chapter12.json');
    loadText('services-Chapter13', 'services-Chapter13.json');
    loadText('service-benefits', 'service-benefits.json');
    loadText('why-choose-us', 'why-choose-us.json');
    loadText('about-us', 'about-us.json');
    loadText('about-meet-eric', 'about-meet-eric.json');
    loadText('about-erics-role', 'about-erics-role.json');
    loadText('about-education', 'about-education.json');
    loadText('about-client-commitment', 'about-client-commitment.json');
}

window.addEventListener('DOMContentLoaded', initLoadText);
