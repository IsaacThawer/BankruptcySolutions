// Global variables to hold clients data and the currently selected client
let clients = [];
let selectedClient = null;

/**
 * Load clients from the backend API (/api/clients) and then populate the client list.
 */
async function loadClients() {
    try {
        const response = await fetch('/api/clients'); 
        clients = await response.json();
        populateClients(clients); // Ensure the full client list is displayed initially
    } catch (error) {
        console.error("Error loading clients:", error);
    }
}


/**
 * Populate the client list panel with data received from DynamoDB.
 * Adjusted to use the correct DynamoDB attributes: firstName, lastName, and submissionDate.
 */
function populateClients() {
    const clientList = document.getElementById('client-list');
    clientList.innerHTML = '';

    clients.forEach(client => {
      // Create a new element for each client
      const clientItem = document.createElement('div');
      clientItem.className = 'client-item';
      // Set a data attribute so we can identify the client item later
      clientItem.setAttribute('data-email', client.email);
      // Add click event listener to select this client when clicked
      clientItem.addEventListener('click', () => selectClient(client.email));
      // Populate inner HTML 
      clientItem.innerHTML = `
          <span>${client.firstName} ${client.lastName}</span>
          ${client.flagged ? '<span class="flagged">⚑</span>' : ''}
          <span class="time">${client.submissionDate}</span>`;
      clientList.appendChild(clientItem);
  });
}

/**
 * When a client is selected:
 * - Remove the "active" class from all client items.
 * - Add the "active" class to the selected client item.
 * - Display the client’s details in the details panel.
 * - Pull the follow-up notes from the client record if they exist.
 */
function selectClient(email) {
    // Find the client by email
    selectedClient = clients.find(client => client.email === email);
    if (selectedClient) {
        // Remove 'active' class from all client items
        const allItems = document.querySelectorAll('.client-item');
        allItems.forEach(item => item.classList.remove('active'));

        // Add 'active' class to the selected client item using the data-email attribute
        const selectedItem = document.querySelector(`.client-item[data-email="${selectedClient.email}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // Populate the details panel with the client data
        document.getElementById('first-name').value = selectedClient.firstName;
        document.getElementById('last-name').value = selectedClient.lastName;
        document.getElementById('email').value = selectedClient.email;
        document.getElementById('phone').value = selectedClient.phoneNumber;
        document.getElementById('help-request').value = selectedClient.message;
        // Pull follow-up notes from the record if they exist; otherwise, leave blank
        document.getElementById('follow-up-notes').value = selectedClient.followUpNotes || '';
    }
}

/**
 * Save the follow-up notes to DynamoDB by calling the backend API (/api/clients/notes).
 * The notes are saved under the followUpNotes attribute.
 *
 * - Retrieves the notes from the textarea.
 * - Sends a POST request with email, timestamp, and notes.
 * - On success, updates the local client object with the new notes.
 */
async function saveNotes() {
    if (!selectedClient) {
        alert('No client selected');
        return;
    }

    // Retrieve the notes entered by the user
    const notes = document.getElementById('follow-up-notes').value;

    try {
        const response = await fetch('/api/clients/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send necessary data to update the follow-up notes for the client record
            body: JSON.stringify({ 
                submissionId: selectedClient.submissionId,
                notes 
            })
        });
    
        const result = await response.json();
        console.log("Response from server:", result);
    
        if (response.ok) {
            // Update the local client object with the newly saved follow-up notes
            selectedClient.followUpNotes = notes;
            alert('Notes saved successfully.');
        } else {
            alert('Failed to save notes.');
        }
    } catch (error) {
        console.error("Error saving notes:", error);
        alert('Error saving notes.');
    }
}

// Load the clients when the page loads
loadClients();

/**
 * DELETE the selected client after user confirmation.
 * - If a client is selected, a confirmation prompt appears.
 * - If confirmed, sends a DELETE request to the server with the selected client's submissionId.
 * - On success, removes the client from the list and clears the details panel.
 */
function deleteClient() {
    if (!selectedClient) {
        alert('No client selected');
        return;
    }
    // Ask for confirmation
    if (!confirm('Are you sure you want to delete this client?')) {
        return;
    }
    
    // Send DELETE request with the submissionId
    fetch('/api/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: selectedClient.submissionId })
    })
    .then(response => response.json())
    .then(result => {
        console.log("Delete response:", result);
        if (result.success) {
            alert('Client deleted successfully.');
            // Remove the deleted client from the clients array
            clients = clients.filter(client => client.submissionId !== selectedClient.submissionId);
            // Clear the selected client and update UI
            selectedClient = null;
            populateClients();
            // Clear details panel fields
            document.getElementById('first-name').value = '';
            document.getElementById('last-name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('help-request').value = '';
            document.getElementById('follow-up-notes').value = '';
        } else {
            alert('Failed to delete client.');
        }
    })
    .catch(error => {
        console.error("Error deleting client:", error);
        alert('Error deleting client.');
    });
}


/**
 * replyToEmail() function to open the default email app
 * with the selected client's email address prepopulated in the "To" field.
 */
function replyToEmail() {
    if (!selectedClient) {
        alert('No client selected');
        return;
    }
    // Open the default email application with the client's email address
    window.location.href = "mailto:" + selectedClient.email;
}


/**
 *  Toggle the flagged status for the selected client.
 * - Checks if a client is selected.
 * - Toggles the flagged property.
 * - Sends a POST request to the /api/clients/flag endpoint with the new flag value.
 * - On success, updates the local client object and refreshes the client list UI.
 */
function toggleFlag() {
    if (!selectedClient) {
        alert('No client selected');
        return;
    }
    // Toggle flagged status: if undefined, treat as false.
    const newFlag = !selectedClient.flagged;
    fetch('/api/clients/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            submissionId: selectedClient.submissionId,
            flagged: newFlag
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log("Flag update response:", result);
        if (result.success) {
            selectedClient.flagged = newFlag;
            populateClients();
        } else {
            alert('Failed to update flag.');
        }
    })
    .catch(error => {
        console.error("Error updating flag:", error);
        alert('Error updating flag.');
    });
}

function searchClients() {
    const searchInput = document.getElementById('search').value.toLowerCase().trim();

    if (searchInput === '') {
        // If input is empty, show all clients
        populateClients(clients);
        return;
    }

    const filteredClients = clients.filter(client => 
        client.firstName.toLowerCase().includes(searchInput) ||
        client.lastName.toLowerCase().includes(searchInput) ||
        client.email.toLowerCase().includes(searchInput)
    );

    populateClients(filteredClients);
}


function formatTimestamp(isoString) {
    const date = new Date(isoString);
    
    // Format date as MM/DD/YYYY
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Format time as HH:MM AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12 for 12 AM
    
    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}

function populateClients(clientData) {
    const clientList = document.getElementById('client-list');
    clientList.innerHTML = '';

    clientData.forEach(client => {
        // Create a new element for each client
        const clientItem = document.createElement('div');
        clientItem.className = 'client-item';
        // Set a data attribute so we can identify the client item later
        clientItem.setAttribute('data-email', client.email);
        // Add click event listener to select this client when clicked
        clientItem.addEventListener('click', () => selectClient(client.email));
        // Populate inner HTML with formatted timestamp
        clientItem.innerHTML = `
            <span>${client.firstName} ${client.lastName}</span>
            ${client.flagged ? '<span class="flagged">⚑</span>' : ''}
            <span class="time">${formatTimestamp(client.submissionDate)}</span>`;
        clientList.appendChild(clientItem);
    });
}