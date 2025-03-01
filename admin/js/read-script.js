
async function loadText(contID, filename) {
    const response = await fetch(`/admin/content/${filename}`, {
        method: 'GET',
    }); // load from server
    const dataText = await response.json();
    document.getElementById(contID).innerHTML = dataText.text;
}


window.addEventListener('DOMContentLoaded', () => {
    // define all content to load in an object
    const content = {
        "home-page-title": "index-title.json",
        "home-page-description": "index-description.json",
        "home-page-contactInfo": "index-contact.json",
        "home-page-chapter": "index-chapter.json",
        "home-page-services": "index-services.json",
        "home-page-reviews": "index-reviews.json",

        "chapter-Title1": "chapter-Title1.json",
        "chapter-Title2": "chapter-Title2.json",
        "chapter-Title3": "chapter-Title3.json",
        "chapter-Title4": "chapter-Title4.json",
        
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

    // function to update the correct service description
    function updateServiceDescription(chapter) {
        const serviceDescription = document.getElementById(`services${chapter}`);
        if (serviceDescription) {
            fetch(`/admin/content/services-${chapter}.json`)
                .then((response) => response.text())
                .then((text) => {
                    serviceDescription.innerText = text;
                });
        }
    }

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



    
    loadText("home-page-chapter", "chapter-Title1.json");

    // handle chapter selection for services and chapter titles
    const chapterSelection = document.getElementById("home-page-chapter-selection");
    const updateChapterButton = document.getElementById("update-chapter-button");
    const chapterTextarea = document.getElementById("home-page-chapter");

    // when chapter is selected, update the title in the text area
    chapterSelection.addEventListener("change", async (event) => {
        const chapterSelectionValue = event.target.value;
        const filename = `chapter-Title${chapterSelectionValue}.json`;
    
        // load the text content into the textarea correctly
        const response = await fetch(`/admin/content/${filename}`);
        const text = await response.text();
        chapterTextarea.value = text;  // Use .value instead of innerHTML
    });

    // when the "Update" button is clicked, save the chapter title
    updateChapterButton.addEventListener("click", async () => {
        const chapterNum = chapterSelection.value;
        const filename = `chapter-Title${chapterNum}.json`;
    
        await saveText("home-page-chapter", filename); // Save content
    
        // reload the content after saving
        setTimeout(async () => {
            const response = await fetch(`/admin/content/${filename}`);
            const updatedText = await response.text();
            chapterTextarea.value = updatedText;  // Ensure updated content appears
        }, 500);
    
        // update <h3> on the page after saving
        const chapterHeader = document.getElementById(`chapter-Title${chapterNum}`);
        if (chapterHeader) {
            chapterHeader.innerText = chapterTextarea.value;
        }
    });

    
    // initially load Yelp review by default into textarea
    loadText("home-page-reviews", "review1.json");

    // update the review content when a review type is selected from the dropdown
    const reviewSelection = document.getElementById("home-page-reviews-selection");
    reviewSelection.addEventListener("change", async (event) => {
        const reviewType = event.target.value; // get the selected review type (Yelp or Google)
        const filename = reviewType === "Yelp" ? "review1.json" : "g-review1.json"; // google review file now 'g-review1.json'

        // dynamically load the content for the selected review type into the textarea
        await loadText("home-page-reviews", filename);
        
        // update the textarea content directly
        const reviewContent = document.getElementById("home-page-reviews");
        if (reviewContent) {
            reviewContent.value = reviewContent.innerHTML;  // Make sure value is updated to match loaded content
        }
    });

    // event listener for the "Update" button for reviews
    const updateReviewButton = document.getElementById("update-reviews-button");
    updateReviewButton.addEventListener("click", function () {
        const reviewType = reviewSelection.value;
        const filename = reviewType === "Yelp" ? "review1.json" : "g-review1.json"; // correct review file based on selection

        const reviewContent = document.getElementById("home-page-reviews").value; // get updated review content from textarea

        // save the updated review text using the existing saveText function
        saveText('home-page-reviews', filename);

        // update the review section on the page with the new content
        const reviewElement = document.getElementById(reviewType === "Yelp" ? "review1" : "g-review1");
        if (reviewElement) {
            reviewElement.innerText = reviewContent;
        }
        
        // ensure the dropdown reflects the correct selected review type after updating
        reviewSelection.value = reviewType; // reset the dropdown to the selected review type
    });
});