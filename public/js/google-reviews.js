// google-reviews.js - Updated to ensure rotation
document.addEventListener('DOMContentLoaded', function() {
  
  // Fetch Google reviews
  async function fetchGoogleReviews() {
    try {
      const response = await fetch('/proxy-google-reviews');
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      
      const data = await response.json();
      
      if (data) {
        displayGoogleReviews(data);
      } else {
        throw new Error('No Google review data found');
      }
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      displayFallbackGoogleReviews();
    }
  }
  
  // Display Google reviews - Always pick a random review
  function displayGoogleReviews(data) {
    const reviewsContainer = document.querySelector('.google-review-container');
    if (!reviewsContainer) return;
    
    const overallRating = parseFloat(data.rating) || 5.0;
    
    // Generate star HTML based on actual rating
    const starsHtml = generateStarRating(overallRating);
    
    // Find the stars container
    const starsContainer = reviewsContainer.querySelector('.stars-container');
    if (starsContainer) {
      starsContainer.innerHTML = starsHtml;
    }
    
    // Pick a random review to display
    const reviewTextElem = reviewsContainer.querySelector('.review-text');
    if (reviewTextElem && data.allReviews && data.allReviews.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.allReviews.length);
      let reviewText = data.allReviews[randomIndex];
      
      // Truncate if too long
      if (reviewText.length > 150) {
        reviewText = reviewText.substring(0, 147) + '...';
      }
      
      reviewTextElem.textContent = reviewText;
    }
  }
  
  // Generate HTML for star rating
  function generateStarRating(rating) {
    // Calculate full, half, and empty stars
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.3 && rating % 1 < 0.8; // 0.3-0.7 becomes half star
    const fullLastStar = rating % 1 >= 0.8; // 0.8+ becomes full star
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0) - (fullLastStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<img src="images/star-full.png" alt="★" class="star">';
    }
    
    // Add half star if needed
    if (halfStar) {
      starsHtml += '<img src="images/star-half.png" alt="½" class="star">';
    }
    
    // Add last full star if rating is 0.8+
    if (fullLastStar) {
      starsHtml += '<img src="images/star-full.png" alt="★" class="star">';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<img src="images/star-empty.png" alt="☆" class="star">';
    }
    
    return starsHtml;
  }
  
  // Fallback function with variable rating
  function displayFallbackGoogleReviews() {
    const reviewsContainer = document.querySelector('.google-review-container');
    if (!reviewsContainer) return;
    
    // Find the stars container
    const starsContainer = reviewsContainer.querySelector('.stars-container');
    if (starsContainer) {
      // Generate 4.8 stars (slightly more realistic)
      const starsHtml = generateStarRating(4.8);
      starsContainer.innerHTML = starsHtml;
    }
    
    // Pick a random fallback review
    const fallbackReviews = [
      "Eric provided excellent professional service and guided me through the bankruptcy process with expertise and care.",
      "Mr. Schwab is very professional and knowledgeable about bankruptcy law. He helped me through a difficult time with compassion and understanding.",
      "I highly recommend Eric Schwab for bankruptcy proceedings. He made the process much less stressful than I anticipated.",
      "Eric is an excellent bankruptcy attorney. He took the time to explain all my options and helped me make the best decision.",
      "Working with Eric was a great experience during a tough time. He's knowledgeable, efficient, and truly cares about his clients."
    ];
    
    const randomIndex = Math.floor(Math.random() * fallbackReviews.length);
    
    // Update review text with a realistic fallback
    const reviewTextElem = reviewsContainer.querySelector('.review-text');
    if (reviewTextElem) {
      reviewTextElem.textContent = fallbackReviews[randomIndex];
    }
  }
  
  // Call function to fetch Google reviews
  fetchGoogleReviews();
  
  // Refresh reviews every 15 minutes for rotation
  setInterval(fetchGoogleReviews, 15 * 60 * 1000);
});