// __tests__/reviews-loader.test.js

// Import functions after mock setup
const { loadGoogleReviews, loadYelpReviews, displayReviews } = require('../public/js/reviews-loader');

describe('Reviews Loader', () => {
  let mockElement;
  
  // Setup global mocks
  beforeAll(() => {
    // Mock fetch globally
    global.fetch = jest.fn();

    // Mock console.error
    global.console.error = jest.fn();
  });
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock DOM element with returned value
    mockElement = {
      innerHTML: '',
      appendChild: jest.fn()
    };
    
    // Setup document mocks using direct assignment
    document.getElementById = jest.fn().mockImplementation(() => mockElement);
    document.createElement = jest.fn().mockImplementation(() => ({
      className: '',
      innerHTML: ''
    }));
    document.addEventListener = jest.fn();
    
    // Setup fetch mock with default success response
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ reviews: [] })
    });
  });

  // Test loadGoogleReviews function
  describe('loadGoogleReviews', () => {
    it('should fetch Google reviews from the correct endpoint', async () => {
      await loadGoogleReviews();
      
      expect(fetch).toHaveBeenCalledWith('/admin/content/google-reviews.json');
    });

    it('should call displayReviews with the correct container and data', async () => {
      const mockReviews = [{ name: 'Test User', rating: 5 }];
      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ reviews: mockReviews })
      });
      
      await loadGoogleReviews();
      
      expect(document.getElementById).toHaveBeenCalledWith('google-reviews-container');
    });

    it('should handle errors when fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      await loadGoogleReviews();
      
      expect(console.error).toHaveBeenCalledWith('Error loading Google reviews:', expect.any(Error));
      expect(mockElement.innerHTML).toContain('Error loading reviews');
    });
  });

  // Test loadYelpReviews function
  describe('loadYelpReviews', () => {
    it('should fetch Yelp reviews from the correct endpoint', async () => {
      await loadYelpReviews();
      
      expect(fetch).toHaveBeenCalledWith('/admin/content/yelp-reviews.json');
    });

    it('should call displayReviews with the correct container and data', async () => {
      const mockReviews = [{ name: 'Test User', rating: 4 }];
      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ reviews: mockReviews })
      });
      
      await loadYelpReviews();
      
      expect(document.getElementById).toHaveBeenCalledWith('yelp-reviews-container');
    });

    it('should handle errors when fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      
      await loadYelpReviews();
      
      expect(console.error).toHaveBeenCalledWith('Error loading Yelp reviews:', expect.any(Error));
      expect(mockElement.innerHTML).toContain('Error loading reviews');
    });
  });

  // Test displayReviews function
  describe('displayReviews', () => {
    it('should display each active review in the container', () => {
      const mockReviews = [
        { name: 'User 1', rating: 4, date: '2023-01-01', content: 'Great!', active: true },
        { name: 'User 2', rating: 5, date: '2023-01-02', content: 'Awesome!', active: true }
      ];
      
      displayReviews('test-container', mockReviews);
      
      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.getElementById).toHaveBeenCalledWith('test-container');
    });

    it('should filter out inactive reviews', () => {
      const mockReviews = [
        { name: 'User 1', rating: 4, date: '2023-01-01', content: 'Great!', active: true },
        { name: 'User 2', rating: 5, date: '2023-01-02', content: 'Awesome!', active: false }
      ];
      
      displayReviews('test-container', mockReviews);
      
      expect(document.createElement).toHaveBeenCalledTimes(1);
    });

    it('should show a message when no active reviews exist', () => {
      const mockReviews = [
        { name: 'User 1', rating: 4, date: '2023-01-01', content: 'Great!', active: false }
      ];
      
      displayReviews('test-container', mockReviews);
      
      expect(mockElement.innerHTML).toContain('No reviews available');
      expect(document.createElement).not.toHaveBeenCalled();
    });
    
    it('should create star ratings based on review rating', () => {
      // Create a mock review card with a specific innerHTML property we can check
      const mockReviewCard = {
        className: '',
        innerHTML: ''
      };
      
      // Make createElement return our special mock for this test
      document.createElement.mockReturnValueOnce(mockReviewCard);
      
      const mockReviews = [
        { name: 'User 1', rating: 3, date: '2023-01-01', content: 'Good!', active: true }
      ];
      
      displayReviews('test-container', mockReviews);
      
      // Check that the created review card contains star images
      expect(mockReviewCard.innerHTML).toContain('star-full.png');
      expect(mockReviewCard.innerHTML).toContain('star-empty.png');
    });
  });
});