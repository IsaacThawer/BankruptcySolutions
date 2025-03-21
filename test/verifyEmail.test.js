
// Import verifyEmail 
const verifyEmail  = require('../public/js/form-handler');


  beforeEach(() => {
    // Reset any previous mock implementation for fetch
    global.fetch = jest.fn();
  });

  test("returns true when the email is valid", async () => {
    //mock fetch to resolve with a JSON object having valid: true
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ valid: true }),
    });

    //call verifyEmail with a test email
    const result = await verifyEmail("test@example.com");

    //result should be true and fetch should have been called with the correct URL
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      '/verify-email?email=' + encodeURIComponent("test@example.com")
    );
  });

  test("returns false when fetch fails", async () => {
    // mock fetch to reject with an error
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    //call verifyEmail with a test email
    const result = await verifyEmail("test@example.com");

    //result should be false
    expect(result).toBe(false);
  });
