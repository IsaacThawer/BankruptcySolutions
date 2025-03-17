
// Define global.fetch 
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

// Import  functions 
const { renderPagination, populateClients } = require('../admin/js/client_submissions');

// Simple DOM setup before each test.
beforeEach(() => {
  // Set up required DOM elements
  document.body.innerHTML = `
    <div id="client-list"></div>
    <div id="pagination-container"></div>
    <input id="first-name" />
    <input id="last-name" />
    <input id="email" />
    <input id="phone" />
    <textarea id="help-request"></textarea>
    <textarea id="follow-up-notes"></textarea>
  `;
});

describe("populateClients", () => {
  test("should render the correct number of client items", () => {
    const mockClients = [
      { submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com" },
      { submissionId: "2", firstName: "Jane", lastName: "Doe", submissionDate: "2024-03-02T10:00:00Z", email: "jane@example.com" },
      { submissionId: "3", firstName: "Alice", lastName: "Smith", submissionDate: "2024-03-03T10:00:00Z", email: "alice@example.com" },
      { submissionId: "4", firstName: "Bob", lastName: "Brown", submissionDate: "2024-03-04T13:00:00Z", email: "bob@example.com" },
      { submissionId: "5", firstName: "Charlie", lastName: "White", submissionDate: "2024-03-05T14:00:00Z", email: "charlie@example.com" },
      { submissionId: "6", firstName: "Dave", lastName: "Black", submissionDate: "2024-03-06T15:00:00Z", email: "dave@example.com" },
      { submissionId: "7", firstName: "Eva", lastName: "Green", submissionDate: "2024-03-07T16:00:00Z", email: "eva@example.com" }
    ];
    // Call populateClients with our simple mock data.
    populateClients(mockClients);

    // Check that a .client-item element is created for each client.
    const clientItems = document.querySelectorAll(".client-item");
    expect(clientItems.length).toBe(mockClients.length);
  });
});

describe("renderPagination", () => {
  test("should render pagination buttons when total items exceed items per page", () => {
    // Assume itemsPerPage is 15 as defined in your module.
    // Here we use a total of 20 items so that pagination is needed.
    const totalItems = 20;
    renderPagination(totalItems);

    // Expect that the pagination container has at least one button.
    const paginationButtons = document.querySelectorAll("#pagination-container button");
    expect(paginationButtons.length).toBeGreaterThan(0);
  });

  test("should not render pagination buttons when total items are less than or equal to items per page", () => {
    // If total items is less than or equal to 15, no pagination buttons should appear.
    const totalItems = 10;
    renderPagination(totalItems);

    const paginationButtons = document.querySelectorAll("#pagination-container button");
    expect(paginationButtons.length).toBe(0);
  });
});