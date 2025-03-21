// Global variables to store the reviews data
let googleReviewsData = [];
let yelpReviewsData = [];

// Function to show the selected tab
function showReviewTab(platform) {
  // Hide all tabs
  document.querySelectorAll('.review-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  
  // Show the selected tab
  document.getElementById(`${platform}-reviews-tab`).classList.add('active');
  
  // Add active class to the clicked button
  event.target.classList.add('active');
}

// Function to load Google reviews for the admin panel
async function loadGoogleReviewsAdmin() {
  try {
    const response = await fetch('/admin/content/google-reviews.json');
    const data = await response.json();
    googleReviewsData = data.reviews;
    displayReviewsAdmin('google-reviews-grid', googleReviewsData);
  } catch (error) {
    console.error('Error loading Google reviews:', error);
    document.getElementById('google-reviews-grid').innerHTML = 
      '<p>Error loading reviews. Please try again later.</p>';
  }
}

// Function to load Yelp reviews for the admin panel
async function loadYelpReviewsAdmin() {
  try {
    const response = await fetch('/admin/content/yelp-reviews.json');
    const data = await response.json();
    yelpReviewsData = data.reviews;
    displayReviewsAdmin('yelp-reviews-grid', yelpReviewsData);
  } catch (error) {
    console.error('Error loading Yelp reviews:', error);
    document.getElementById('yelp-reviews-grid').innerHTML = 
      '<p>Error loading reviews. Please try again later.</p>';
  }
}

// Function to display reviews in the admin panel
function displayReviewsAdmin(containerId, reviews) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  reviews.forEach((review, index) => {
    const reviewCard = document.createElement('div');
    reviewCard.className = `review-admin-card ${review.active ? 'active' : 'inactive'}`;
    
    // Generate stars HTML
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < review.rating) {
        starsHtml += '<img src="/images/star-full.png" alt="★" class="admin-star">';
      } else {
        starsHtml += '<img src="/images/star-empty.png" alt="☆" class="admin-star">';
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
      <div class="review-actions">
        <label class="toggle-switch">
          <input type="checkbox" ${review.active ? 'checked' : ''} 
            onchange="toggleReview('${containerId === 'google-reviews-grid' ? 'google' : 'yelp'}', ${index})">
          <span class="slider round"></span>
        </label>
        <span class="toggle-label">${review.active ? 'Active' : 'Hidden'}</span>
      </div>
    `;
    
    container.appendChild(reviewCard);
  });
}

// Function to toggle a review on or off
async function toggleReview(platform, index) {
  try {
    // Get the correct data array
    const reviewsData = platform === 'google' ? googleReviewsData : yelpReviewsData;
    
    // Toggle the active state
    reviewsData[index].active = !reviewsData[index].active;
    
    // Prepare the updated data
    const updatedData = {
      reviews: reviewsData
    };
    
    // Send the update to the server
    const response = await fetch(`/admin/content/${platform}-reviews.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    
    if (response.ok) {
      // Refresh the display
      if (platform === 'google') {
        displayReviewsAdmin('google-reviews-grid', googleReviewsData);
      } else {
        displayReviewsAdmin('yelp-reviews-grid', yelpReviewsData);
      }
    } else {
      console.error('Failed to update review status');
      alert('Failed to update review status. Please try again.');
    }
  } catch (error) {
    console.error('Error updating review:', error);
    alert('An error occurred while updating the review.');
  }
}

// Export functions for testing
 if (typeof module !== 'undefined') {
   module.exports = { 
     showReviewTab, 
     loadGoogleReviewsAdmin, 
     loadYelpReviewsAdmin, 
     displayReviewsAdmin, 
     toggleReview, 
     initReviewsManagement 
   };
 }

// Initialize the reviews management when that tab is selected
function initReviewsManagement() {
  loadGoogleReviewsAdmin();
  loadYelpReviewsAdmin();
}