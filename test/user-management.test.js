/** @jest-environment jsdom */

// user-management.test.js
const { addUser, deleteUser, loadUsers } = require('../admin/js/dashboard');


describe('User management functions', () => {
  beforeEach(() => {
    // Set up our DOM elements
    document.body.innerHTML = `
      <input type="text" id="modify-username" value="testuser">
      <input type="text" id="modify-phone-number" value="1234567890">
      <input type="email" id="modify-email" value="test@example.com">
      <input type="password" id="modify-password" value="Password123!">
      <input type="password" id="modify-password-verify" value="Password123!">
      <select id="modify-role">
        <option value="Editor" selected>Editor</option>
      </select>
      <div id="user-list"></div>
    `;

    // Set up mocks for localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();

    // Stub out alert and confirm
    global.alert = jest.fn();
    global.confirm = jest.fn(() => true);

    // Clear fetch mocks if any
    global.fetch = jest.fn();

  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch.mockReset();
    global.alert.mockReset();
  });

  test('addUser sends correct payload and calls loadUsers on success', async () => {
    // Setup a fake token in localStorage
    const fakeToken = "header.eyJjb2duaXRvIjoiZmFrZVRva2VuIn0.signature";
    localStorage.getItem.mockReturnValue(fakeToken);

    // Simulate a successful API response
    const mockResponse = { success: true };
    fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
    });

    // Spy on loadUsers (assuming it is a global function)
    const loadUsersSpy = jest.spyOn(window, 'loadUsers').mockImplementation(() => {});

    await addUser();

    // Check that fetch was called with the correct arguments
    const expectedPayload = {
      username: "testuser",
      phone: "1234567890",
      email: "test@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      role: "Editor"
    };

    expect(fetch).toHaveBeenCalledWith(
      'https://u1top45us9.execute-api.us-east-2.amazonaws.com/user',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fakeToken}`
        }),
        body: JSON.stringify(expectedPayload)
      })
    );

    // Verify that loadUsers was called after a successful addition
    expect(loadUsersSpy).toHaveBeenCalled();
    loadUsersSpy.mockRestore();
  });

  test('deleteUser sends correct payload and calls loadUsers on success', async () => {
    // Setup a fake token in localStorage
    const fakeToken = "header.eyJjb2duaXRvIjoiZmFrZVRva2VuIn0.signature";
    localStorage.getItem.mockReturnValue(fakeToken);

    // Simulate a successful DELETE response
    const mockResponse = { success: true };
    fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
    });

    // Spy on loadUsers since it should be called on success
    const loadUsersSpy = jest.spyOn(window, 'loadUsers').mockImplementation(() => {});

    await deleteUser('test@example.com', 'Editor');

    const expectedPayload = {
      email: 'test@example.com',
      role: 'Editor'
    };

    expect(fetch).toHaveBeenCalledWith(
      'https://u1top45us9.execute-api.us-east-2.amazonaws.com/Test/user',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fakeToken}`
        }),
        body: JSON.stringify(expectedPayload)
      })
    );

    expect(loadUsersSpy).toHaveBeenCalled();
    loadUsersSpy.mockRestore();
  });

 

  test('loadUsers updates the user list with fetched data', async () => {
    // Set up a dummy API response for users
    const users = [
      { username: 'ithawer', email: 'ithawer@csus.edu', role: 'Editor' },
      { username: 'isaacthawer', email: 'thawerisaac@gmail.com', role: 'Admin' }
    ];
    const mockResponse = { success: true, users };
    fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse)
    });

    // Grab the container for user list updates
    const userListDiv = document.getElementById('user-list');

    await loadUsers();

    // Verify that fetch was called with the expected endpoint
    expect(fetch).toHaveBeenCalledWith('/api/users');

    // Check if the userListDiv was updated with user emails
    expect(userListDiv.innerHTML).toContain('ithawer@csus.edu');
    expect(userListDiv.innerHTML).toContain('thawerisaac@gmail.com');
  });

  test('addUser handles API error correctly', async () => {
    // Setup a fake token in localStorage
    const fakeToken = "header.fakeToken.signature";
    localStorage.getItem.mockReturnValue(fakeToken);
  
    // Simulate a failed API response (non-ok response)
    fetch.mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue('Error occurred'),
    });
  
    // You might want to spy onerror logging
    global.alert = jest.fn();
  
    await addUser();
  
    // Check that alert is called 
    expect(global.alert).toHaveBeenCalled();
  });

  test('deleteUser handles network error correctly', async () => {
    const fakeToken = "header.fakeToken.signature";
    localStorage.getItem.mockReturnValue(fakeToken);
  
    // Simulate a network error
    fetch.mockRejectedValue(new Error('Network error'));
  
    // Optionally spy on  console.error
    global.alert = jest.fn();
  
    await deleteUser('test@example.com', 'Editor');
  
    // Expect some error handling, for a log message
    expect(global.alert).toHaveBeenCalled();
  });

   test('addUser handles missing or invalid inputs correctly', async () => {
    document.getElementById('modify-username').value = '';
    document.getElementById('modify-email').value = '';
  
    // Simulate an invalid user addition (empty fields)
    await addUser();
  
    // Adjusted to match the error message actually returned
    expect(global.alert).toHaveBeenCalledWith('Error: All fields are required.');
  });

  
});