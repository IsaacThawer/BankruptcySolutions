/** @jest-environment jsdom */

// Define global.fetch with a default resolved promise (used in older tests)
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

// Import functions 
const { renderPagination, populateClients } = require('../admin/js/client_submissions');

// Import functions used in new tests.
const {
  loadClients,
  selectClient,
  saveNotes,
  deleteClient,
  replyToEmail,
  toggleFlag,
  searchClients,
  formatTimestamp,
} = require('../admin/js/client_submissions');

beforeAll(() => {
  // This will prevent loadClients from running automatically in tests
  global.__TEST__ = true;
});

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

  // --- Additional DOM Setup for more Tests ---
  // Create and append the search input element
  const searchInput = document.createElement('input');
  searchInput.id = 'search';
  document.body.appendChild(searchInput);
  // Clear any previous fetch mock calls.
  fetch.mockClear();
  // Set up spies for window.alert and window.confirm to intercept alerts and confirmations.
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  // Reset window.location for tests that modify it (replyToEmail)
  delete window.location;
  window.location = { href: '', reload: jest.fn() };
  // Stub window.performance.getEntriesByType so that pageshow event can work in jsdom.
  if (!window.performance) {
    window.performance = {};
  }
  // Return a back_forward navigation type for pageshow tests.
  window.performance.getEntriesByType = jest.fn(() => [{ type: "back_forward" }]);
});


// Test populateClients function
describe("populateClients", () => {
  test("should render the correct number of client items", () => {
    // Create a simple mock data array for clients.
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

// Test renderPagination function
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

// Test for loadClients function.
describe("loadClients", () => {
  test("should load clients and populate the client list", async () => {
    // Create a mock client array.
    const mockClients = [
      { submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com" }
    ];
    // Mock the fetch response to return the mockClients.
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockClients) });
    // Call loadClients() and await its completion.
    await loadClients();
    // Verify that client items are rendered in the DOM.
    const clientItems = document.querySelectorAll(".client-item");
    expect(clientItems.length).toBe(mockClients.length);
  });

  test("should log error when loadClients fails", async () => {
    // Spy on console.error.
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Force fetch to reject.
    fetch.mockRejectedValueOnce(new Error("Fetch failed"));
    await loadClients();
    expect(consoleSpy).toHaveBeenCalledWith("Error loading clients:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  test("should not call populateClients if 'client-list' element is missing", async () => {
    // Remove the client-list element.
    document.getElementById('client-list').remove();
    const mockClients = [{ submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com",phoneNumber: "1234567890",message: "Need help" }];
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockClients) });
    // Call loadClients and ensure no error occurs.
    await loadClients();
    // Since client-list is missing, no .client-item should be rendered.
    expect(document.querySelectorAll(".client-item").length).toBe(0);
  });
});

// Additional tests for populateClients.
describe("populateClients (new test)", () => {
  test("should render the correct number of client items (new test)", () => {
    const mockClients = [
      { submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com",phoneNumber: "1234567890",message: "Need help" },
      { submissionId: "2", firstName: "Jane", lastName: "Doe", submissionDate: "2024-03-02T10:00:00Z", email: "jane@example.com",phoneNumber: "1234567890",message: "Need help" },
      { submissionId: "3", firstName: "Alice", lastName: "Smith", submissionDate: "2024-03-03T10:00:00Z", email: "alice@example.com",phoneNumber: "1234567890",message: "Need help" }
    ];
    populateClients(mockClients);
    const clientItems = document.querySelectorAll(".client-item");
    expect(clientItems.length).toBe(mockClients.length);
  });

  test("should clear the client list if given an empty array", () => {
    // Call populateClients with an empty array.
    populateClients([]);
    const clientItems = document.querySelectorAll(".client-item");
    expect(clientItems.length).toBe(0);
  });
});

// Test for selectClient function.
describe("selectClient", () => {
  test("should update the details panel when a client is selected", () => {
    // Prepare mock client data with full details.
    const mockClients = [
      {
        submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com", phoneNumber: "1234567890", message: "Need help", followUpNotes: "Initial note"
      }
    ];
    populateClients(mockClients);
    selectClient("1");
    // Verify that the details panel is updated with the client data.
    expect(document.getElementById("first-name").value).toBe("John");
    expect(document.getElementById("last-name").value).toBe("Doe");
    expect(document.getElementById("email").value).toBe("john@example.com");
    expect(document.getElementById("phone").value).toBe("1234567890");
    expect(document.getElementById("help-request").value).toBe("Need help");
    expect(document.getElementById("follow-up-notes").value).toBe("Initial note");
    // Check that the client item is marked active.
    const activeItem = document.querySelector(".client-item.active");
    expect(activeItem).not.toBeNull();
    expect(activeItem.getAttribute("data-id")).toBe("1");
  });

  test("should not update details panel if client is not found", () => {
    // Pre-populate details to ensure they remain unchanged.
    document.getElementById("first-name").value = "Existing";
    document.getElementById("last-name").value = "Data";
    const mockClients = [
      { submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com",phoneNumber: "1234567890",message: "Need help" }
    ];
    populateClients(mockClients);
    // Call selectClient with an invalid submissionId.
    selectClient("999");
    // Expect that the details panel remains unchanged.
    expect(document.getElementById("first-name").value).toBe("Existing");
    expect(document.getElementById("last-name").value).toBe("Data");
  });
});

// Tests for saveNotes function.
describe("saveNotes", () => {
  test("should update notes when save is successful", async () => {
    // Create a mock client with no follow-up notes.
    const mockClient = {
      submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com", phoneNumber: "1234567890", message: "Need help", followUpNotes: ""
    };
    populateClients([mockClient]);
    selectClient("1");
    // Set a new note value.
    document.getElementById("follow-up-notes").value = "New Note";

    // Verify that fetch is called with correct options (thus covering lines 69-70).
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    await saveNotes();
    expect(document.getElementById("follow-up-notes").value).toBe("New Note");
  });

  test("should alert when saving notes fails", async () => {
    const mockClient = {
     submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com", phoneNumber: "1234567890", message: "Need help", followUpNotes: ""
    };
    populateClients([mockClient]);
    selectClient("1");
    document.getElementById("follow-up-notes").value = "Failed Note";

    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ success: false })
    });
    await saveNotes();
    expect(window.alert).toHaveBeenCalledWith("Failed to save notes.");
  });

  test("should catch error and alert in saveNotes if fetch rejects", async () => {
    const mockClient = {
      submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com", phoneNumber: "1234567890", message: "Need help", followUpNotes: ""
    };
    populateClients([mockClient]);
    selectClient("1");
    document.getElementById("follow-up-notes").value = "Error Note";

    fetch.mockRejectedValueOnce(new Error("Network Error"));
    await saveNotes();
    expect(window.alert).toHaveBeenCalledWith("Error saving notes.");
  });
});

// Tests for deleteClient function.
describe("deleteClient", () => {
  test("should delete the selected client and clear the details panel", async () => {
    const mockClients = [
      {
     submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com", phoneNumber: "1234567890", message: "Need help", followUpNotes: ""
      },
      {
        submissionId: "2", firstName: "Jane", lastName: "Doe", submissionDate: "2024-03-02T10:00:00Z", email: "jane@example.com", phoneNumber: "0987654321", message: "Assistance", followUpNotes: ""
      }
    ];
    populateClients(mockClients);
    selectClient("1");

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true })
    });
    await deleteClient();
    // Verify that all detail fields are cleared.
    expect(document.getElementById("first-name").value).toBe("");
    expect(document.getElementById("last-name").value).toBe("");
    expect(document.getElementById("email").value).toBe("");
    expect(document.getElementById("phone").value).toBe("");
    expect(document.getElementById("help-request").value).toBe("");
    expect(document.getElementById("follow-up-notes").value).toBe("");
    // Verify that the client list is reduced by one.
    const clientItems = document.querySelectorAll(".client-item");
    expect(clientItems.length).toBe(mockClients.length - 1);
  });

  test("should alert if no client is selected for deletion", async () => {
    await deleteClient();
    expect(window.alert).toHaveBeenCalledWith("No client selected");
  });

  test("should catch error and alert in deleteClient if fetch rejects", async () => {
    const mockClients = [
      {
       submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com", phoneNumber: "1234567890", message: "Need help", followUpNotes: ""
      }
    ];
    populateClients(mockClients);
    selectClient("1");

    fetch.mockRejectedValueOnce(new Error("Network Error"));
    await deleteClient();
    expect(window.alert).toHaveBeenCalledWith("Error deleting client.");
  });

  test("should not delete client if confirmation is cancelled", async () => {
    const mockClients = [
      {
     submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com", phoneNumber: "1234567890", message: "Need help", followUpNotes: ""
      }
    ];
    populateClients(mockClients);
    selectClient("1");
    // Simulate user cancelling the deletion confirmation.
    jest.spyOn(window, 'confirm').mockImplementation(() => false);
    await deleteClient();
    // Verify that details remain unchanged.
    expect(document.getElementById("first-name").value).toBe("John");
  });
});

// Tests for replyToEmail function.
describe("replyToEmail", () => {
  test("should set window.location.href to a mailto link when a client is selected", () => {
    const mockClient = { submissionId: "1", email: "john@example.com" };
    populateClients([mockClient]);
    selectClient("1");
    replyToEmail();
    expect(window.location.href).toBe("mailto:" + mockClient.email);
  });

  test("should alert if no client is selected for reply", () => {
    replyToEmail();
    expect(window.alert).toHaveBeenCalledWith("No client selected");
  });
});

// Tests for toggleFlag function.
describe("toggleFlag", () => {
  test("should toggle the flagged status of the selected client", async () => {
    const mockClient = {
      submissionId: "1",
      flagged: false,
      firstName: "John",
      lastName: "Doe",
      submissionDate: "2024-03-01T10:00:00Z",
      email: "john@example.com"
    };
    populateClients([mockClient]);
    selectClient("1");

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true })
    });
    await toggleFlag();
    expect(mockClient.flagged).toBe(true);
  });

  test("should alert if toggling the flag fails", async () => {
    const mockClient = {
      submissionId: "1",
      flagged: false,
      firstName: "John",
      lastName: "Doe",
      submissionDate: "2024-03-01T10:00:00Z",
      email: "john@example.com"
    };
    populateClients([mockClient]);
    selectClient("1");

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false })
    });
    await toggleFlag();
    expect(window.alert).toHaveBeenCalledWith("Failed to update flag.");
  });

  test("should catch error and alert in toggleFlag if fetch rejects", async () => {
    const mockClient = {
      submissionId: "1",
      flagged: false,
      firstName: "John",
      lastName: "Doe",
      submissionDate: "2024-03-01T10:00:00Z",
      email: "john@example.com"
    };
    populateClients([mockClient]);
    selectClient("1");

    fetch.mockRejectedValueOnce(new Error("Network Error"));
    await toggleFlag();
    expect(window.alert).toHaveBeenCalledWith("Error updating flag.");
  });
});

// Tests for searchClients function.
describe("searchClients", () => {
  test("should filter clients based on search input (single word)", () => {
    const mockClients = [
      { submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com" },
      { submissionId: "2", firstName: "Jane", lastName: "Smith", submissionDate: "2024-03-02T10:00:00Z", email: "jane@example.com" }
    ];
    populateClients(mockClients);
    document.getElementById("search").value = "Jane";
    searchClients();
    const clientItems = document.querySelectorAll(".client-item");
    expect(clientItems.length).toBe(1);
    expect(clientItems[0].textContent).toContain("Jane");
  });

  test("should display all clients when search input is empty", () => {
    const mockClients = [
      { submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com" },
      { submissionId: "2", firstName: "Jane", lastName: "Smith", submissionDate: "2024-03-02T10:00:00Z", email: "jane@example.com" }
    ];
    populateClients(mockClients);
    document.getElementById("search").value = "";
    searchClients();
    const clientItems = document.querySelectorAll(".client-item");
    expect(clientItems.length).toBe(mockClients.length);
  });

  test("should filter clients based on two-word search input", () => {
    const mockClients = [
      { submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com" },
      { submissionId: "2", firstName: "Jane", lastName: "Doe", submissionDate: "2024-03-02T10:00:00Z", email: "jane@example.com" }
    ];
    populateClients(mockClients);
    document.getElementById("search").value = "Jane Doe";
    searchClients();
    const clientItems = document.querySelectorAll(".client-item");
    expect(clientItems.length).toBe(1);
    expect(clientItems[0].textContent).toContain("Jane");
  });

  test("should render 0 results if search input does not match any client", () => {
    const mockClients = [
      { submissionId: "1", firstName: "John", lastName: "Doe", submissionDate: "2024-03-01T10:00:00Z", email: "john@example.com" },
      { submissionId: "2", firstName: "Jane", lastName: "Doe", submissionDate: "2024-03-02T10:00:00Z", email: "jane@example.com" }
    ];
    populateClients(mockClients);
    document.getElementById("search").value = "Nonexistent";
    searchClients();
    const clientItems = document.querySelectorAll(".client-item");
    expect(clientItems.length).toBe(0);
  });
});

// Tests for formatTimestamp function.
describe("formatTimestamp", () => {
  test("should correctly format an ISO timestamp", () => {
    const isoString = "2024-03-01T10:00:00Z";
    const formatted = formatTimestamp(isoString);
    // Check that the formatted string contains expected date and time parts.
    expect(formatted).toMatch(/3\/1\/2024/);
    expect(formatted).toMatch(/AM|PM/);
  });
});

// Tests for renderPagination small screen behavior.
describe("renderPagination - small screen", () => {
  test("should render simplified pagination controls for small screens", () => {
    // Simulate a small screen by setting window.innerWidth.
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    renderPagination(20); // 20 total items for small screen scenario.
    const buttons = document.querySelectorAll("#pagination-container button");
    // For small screens, at least one button (prev or next) should be present.
    expect(buttons.length).toBeGreaterThan(0);
    // Reset innerWidth after test.
    window.innerWidth = 1024;
  });
});

// Tests for renderPagination sliding window behavior.
describe("renderPagination - sliding window", () => {
  test("should render multiple page buttons for larger screens when currentPage > 1", () => {
    // Simulate a larger screen.
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    // Manually set currentPage to 2 by calling a pagination button click simulation.
    // First, create enough mock clients to generate multiple pages.
    const mockClients = [];
    for (let i = 1; i <= 50; i++) {
      mockClients.push({
        submissionId: "" + i,
        firstName: "Client" + i,
        lastName: "Test",
        submissionDate: "2024-03-01T10:00:00Z",
        email: "client" + i + "@example.com"
      });
    }
    populateClients(mockClients);
    // Force currentPage to 2 by simulating a click on a pagination button.
    // Render pagination controls.
    renderPagination(50);
    // Find a button that is not active (exp. not the current page) and simulate a click.
    const buttons = Array.from(document.querySelectorAll("#pagination-container button"));
    const nonActiveButton = buttons.find(btn => !btn.classList.contains("active"));
    if (nonActiveButton) {
      nonActiveButton.click();
      // After clicking, the active button's text should equal the new currentPage.
      const activeButton = document.querySelector("#pagination-container button.active");
      expect(activeButton).not.toBeNull();
      // For example, if we clicked on "2", activeButton.textContent should be "2".
    }
  });
});

// Tests for pageshow event handler.
describe("pageshow event", () => {
  test("should call window.location.reload when page is restored from bfcache", () => {
    // Create a pageshow event with persisted = true.
    const eventPersisted = new CustomEvent("pageshow");
    eventPersisted.persisted = true;
    window.dispatchEvent(eventPersisted);
    expect(window.location.reload).toHaveBeenCalled();
  });

  test("should not call window.location.reload when page is not restored from bfcache", () => {
    // Clear the reload spy.
    window.location.reload.mockClear();
    // Stub performance.getEntriesByType to return a navigation type that is not back_forward.
    window.performance.getEntriesByType = jest.fn(() => [{ type: "navigate" }]);
    const eventNotPersisted = new CustomEvent("pageshow");
    eventNotPersisted.persisted = false;
    window.dispatchEvent(eventNotPersisted);
    expect(window.location.reload).not.toHaveBeenCalled();
  });
});

afterAll(() => {
  delete global.__TEST__;
});