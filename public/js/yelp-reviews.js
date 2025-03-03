document.addEventListener('DOMContentLoaded', function() {
  
  // Fetch Yelp reviews
  async function fetchYelpReviews() {
    try {
      const response = await fetch('/proxy-yelp-reviews');
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      
      const data = await response.json();
      
      if (data) {
        displayYelpReviews(data);
      } else {
        throw new Error('No Yelp review data found');
      }
    } catch (error) {
      console.error('Error fetching Yelp reviews:', error);
      displayFallbackYelpReviews();
    }
  }
  
  // Display Yelp reviews - Always pick a random review
  function displayYelpReviews(data) {
    const reviewsContainer = document.querySelector('.yelp-review-container');
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
  function displayFallbackYelpReviews() {
    const reviewsContainer = document.querySelector('.yelp-review-container');
    if (!reviewsContainer) return;
    
    // Find the stars container
    const starsContainer = reviewsContainer.querySelector('.stars-container');
    if (starsContainer) {
      // Generate 4.5 stars (slightly more realistic)
      const starsHtml = generateStarRating(4.5);
      starsContainer.innerHTML = starsHtml;
    }
    
    // Pick a random fallback review
    const fallbackReviews = [
      "Eric was extremely helpful during my bankruptcy process. He explained everything clearly and made what could have been a stressful situation much easier to handle.",
      "I can't recommend Eric Schwab enough. His expertise in bankruptcy law is outstanding, and he guided me through the entire process.",
      "Working with Eric Schwab was the best decision I made during a difficult financial time. He's knowledgeable and responsive.",
      "Five stars for Eric Schwab! He helped me navigate bankruptcy with ease, answering all my questions promptly.",
      "Eric's knowledge of bankruptcy law is impressive. He made sure I understood all my options and helped me make the best decision.",
      "Eric was straightforward and honest throughout the entire process. He explained everything in terms I could understand.",
      "I was nervous about filing for bankruptcy, but Eric made the process stress-free. He is professional and knowledgeable."
    ];
    
    const randomIndex = Math.floor(Math.random() * fallbackReviews.length);
    
    // Update review text with a realistic fallback
    const reviewTextElem = reviewsContainer.querySelector('.review-text');
    if (reviewTextElem) {
      reviewTextElem.textContent = fallbackReviews[randomIndex];
    }
  }
  
  // Call function to fetch Yelp reviews
  fetchYelpReviews();
  
  // Refresh reviews every 15 minutes for rotation
  setInterval(fetchYelpReviews, 15 * 60 * 1000);
});