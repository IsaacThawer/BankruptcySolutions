// Function to load Google reviews
async function loadGoogleReviews() {
  try {
    const response = await fetch('/admin/content/google-reviews.json');
    const data = await response.json();
    displayReviews('google-reviews-container', data.reviews);
  } catch (error) {
    console.error('Error loading Google reviews:', error);
    document.getElementById('google-reviews-container').innerHTML = 
      '<p>Error loading reviews. Please try again later.</p>';
  }
}

// Function to load Yelp reviews
async function loadYelpReviews() {
  try {
    const response = await fetch('/admin/content/yelp-reviews.json');
    const data = await response.json();
    displayReviews('yelp-reviews-container', data.reviews);
  } catch (error) {
    console.error('Error loading Yelp reviews:', error);
    document.getElementById('yelp-reviews-container').innerHTML = 
      '<p>Error loading reviews. Please try again later.</p>';
  }
}

// Function to display reviews in the container
function displayReviews(containerId, reviews) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  const activeReviews = reviews.filter(review => review.active);
  
  if (activeReviews.length === 0) {
    container.innerHTML = '<p>No reviews available at this time.</p>';
    return;
  }
  
  activeReviews.forEach(review => {
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    // Generate stars HTML
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < review.rating) {
        starsHtml += '<img src="images/star-full.png" alt="★" class="star">';
      } else {
        starsHtml += '<img src="images/star-empty.png" alt="☆" class="star">';
      }
    }
    
    reviewCard.innerHTML = `
      <div class="reviewer-info">
        <h4 class="reviewer-name">${review.name}</h4>
        <p class="reviewer-location">${review.location || ''}</p>
        <span class="review-date">${review.date}</span>
      </div>
      <div class="star-rating">
        ${starsHtml}
      </div>
      <div class="review-content">
        <p>${review.content}</p>
      </div>
    `;
    
    container.appendChild(reviewCard);
  });
}

// Load reviews when the page loads
document.addEventListener('DOMContentLoaded', function() {
  loadGoogleReviews();
  loadYelpReviews();
});