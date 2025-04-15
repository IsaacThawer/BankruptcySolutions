/**
* @jest-environmnet jsdom
*/

const {checkVisibility} = require('../public/js/fade-in');

describe ('Unit Testing for fade-in.js file ', () => {

 // Inner height value used to test for visibility
 Object.defineProperty(window, 'innerHeight', {value: 900});
 let sections;

 beforeEach(() => {
   document.body.innerHTML = '<div class = "fade-in-section" ></div>';

   window.scrollTo = jest.fn();
   document.dispatchEvent(new Event("DOMContentLoaded"));

   sections = document.createElement('div');
   sections.classList.add('fade-in-section');
   document.body.appendChild(sections);
 });

  afterEach(() => {
   jest.restoreAllMocks();
   document.body.innerHTML = ' ';
 })

 test ('Visible class is added for valid inner height values', async () => {
   const sections = document.querySelectorAll(".fade-in-section");
   sections.forEach((section, index) => {
     section.getBoundingClientRect = jest.fn().mockReturnValue({
       top: window.innerHeight * 0.8 * (index + 1), 
     });
   });

   document.dispatchEvent(new Event("DOMContentLoaded"));

   // Check if the 'visible' class is added 
   const firstSection = sections[0];
   expect(firstSection.classList.contains("visible")).toBe(true);
 });

 test ('Test value greater than inner height which should return false', async () => {
   // Test a value that is over the defined inner height value
   sections.getBoundingClientRect = jest.fn(() => ({
     top: 1000,
   }));

   checkVisibility();

   // Expect visible class to not be added
   expect(sections.classList.contains('visible')).toBe(false);
 });
});
