async function loadText(contID, filename) {
    const response = await fetch(`/admin/content/${filename}`, {
        method: 'GET',
    }); // load from server
    const dataText = await response.json();
    document.getElementById(contID).innerHTML = dataText.text;
}

//Moved updateServiceDescription to the global scope for testing purposes and modified to return a promise
function updateServiceDescription(chapter) {  
    const serviceDescription = document.getElementById(`services${chapter}`);
    if (serviceDescription) {
        return fetch(`/admin/content/services-${chapter}.json`)  
            .then((response) => response.text())
            .then((text) => {
                serviceDescription.innerText = text;
            });
    }
    return Promise.resolve(); // returns a promise to fix testing error
} 

window.addEventListener('DOMContentLoaded', () => {
    // define all content to load in an object
    const content = {
        "home-page-title": "index-title.json",
        "home-page-description": "index-description.json",
        "home-page-map": "index-map.json",
        "home-page-contactInfo": "index-contact.json",
        "home-page-chapter": "index-chapter.json",
        "home-page-services": "index-services.json",
        "home-page-reviews": "index-reviews.json",
        
        "reviews-header": "reviews-header.json",
        "review1": "review1.json",
        "review2": "review2.json",
        "review3": "review3.json",

        "services-Chapter7": "services-Chapter7.json",
        "services-Chapter11": "services-Chapter11.json",
        "services-Chapter12": "services-Chapter12.json",
        "services-Chapter13": "services-Chapter13.json",
        
        "service-benefits": "service-benefits.json",
        "why-choose-us": "why-choose-us.json",
        
        "about-us": "about-us.json",
        "about-meet-eric": "about-meet-eric.json",
        "about-erics-role": "about-erics-role.json",
        "about-education": "about-education.json",
        "about-client-commitment": "about-client-commitment.json"
    };

    // iterate over the object and load content dynamically
    for (const [elementId, filename] of Object.entries(content)) {
        loadText(elementId, filename);
    }

    // initially load content for Chapter 7 (default)
    loadText("home-page-services", "services-Chapter7.json");
    updateServiceDescription("Chapter7"); // Update the service card for Chapter 7

    // update the service description when a chapter is selected from the dropdown
    const serviceSelection = document.getElementById("home-page-services-selection");
    serviceSelection.addEventListener("change", async (event) => {
        const chapter = event.target.value; // get the selected chapter value
        const filename = `services-${chapter}.json`; // filename to load based on the selected chapter

        // dynamically load the content for the selected chapter into the text area
        await loadText("home-page-services", filename);

        // Now set the value of the textarea to match the loaded content
        const serviceContent = document.getElementById("home-page-services");
        if (serviceContent) {
            serviceContent.value = serviceContent.innerHTML; // update the textarea content
        }
    });

    // update the service description when the update button is clicked
    const updateButton = document.getElementById("update-services-button");
    const servicesTextarea = document.getElementById("home-page-services");

    if (updateButton && servicesTextarea) {
        updateButton.addEventListener("click", async function () {
            const chapter = serviceSelection.value;
            const filename = `services-${chapter}.json`;
        
            // save updated content
            await saveText('home-page-services', filename);
        
            // reload the content after saving
            setTimeout(async () => {
                await loadText("home-page-services", filename);
            }, 500);
        
            // update homepage service description
            const homepageService = document.getElementById(`services-${chapter}`);
            if (homepageService) {
                homepageService.innerText = servicesTextarea.value;
            }
        });
    } else {
        console.error("Update button or textarea not found!");
    }
});

//****************************************************** */
// Expose loadText and updateServiceDescription for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadText,
        updateServiceDescription
    };
  }

//****************************************************** */