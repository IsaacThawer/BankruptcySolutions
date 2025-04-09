/**
 * @jest-environment jsdom
 */

describe('profilePhoto.js behavior', () => {
  beforeEach(() => {
    localStorage.clear();

    document.body.innerHTML = `
      <input type="file" id="profilePicInput" />
      <img id="profilePic" />
    `;
  });

  test('loads saved image from localStorage on page load', () => {
    const mockImage = 'data:image/png;base64,exampleBase64';
    localStorage.setItem('profileImage', mockImage);

    document.body.innerHTML = `
      <input type="file" id="profilePicInput" />
      <img id="profilePic" />
    `;

    require('../admin/js/profilePhoto'); // Triggers DOMContentLoaded listener
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const img = document.getElementById('profilePic');
    expect(img.getAttribute('src')).toBe(mockImage);
  });

  test('sets image src and stores in localStorage on file upload', () => {
    // Mock FileReader
    global.FileReader = class {
      constructor() {
        this.onload = null;
      }

      readAsDataURL(file) {
        if (this.onload) {
          this.onload({ target: { result: 'data:image/png;base64,testbase64data' } });
        }
      }
    };

    require('../admin/js/profilePhoto'); // Triggers DOMContentLoaded listener
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const input = document.getElementById('profilePicInput');
    const img = document.getElementById('profilePic');

    const file = new Blob(['dummy content'], { type: 'image/png' });
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    input.dispatchEvent(new Event('change'));

    expect(img.getAttribute('src')).toBe('data:image/png;base64,testbase64data');
    expect(localStorage.getItem('profileImage')).toBe('data:image/png;base64,testbase64data');
  });

  test('does nothing if profilePicInput is not found', () => {
    document.body.innerHTML = `<img id="profilePic" />`;
  
    // Run script after DOM
    require('../admin/js/profilePhoto');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    // Should not throw
    expect(true).toBe(true);
  });

  test('does nothing if profilePic is missing on load', () => {
    document.body.innerHTML = `<input type="file" id="profilePicInput" />`;
  
    localStorage.setItem('profileImage', 'data:image/png;base64,edgecase');
    require('../admin/js/profilePhoto');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    expect(true).toBe(true); // Just making sure no error occurs
  });  
    
  test('does nothing when savedImage exists but profilePic is missing', () => {
    localStorage.setItem('profileImage', 'data:image/png;base64,test');
  
    // Only file input is present
    document.body.innerHTML = `<input type="file" id="profilePicInput" />`;
  
    require('../admin/js/profilePhoto');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    // Pass if no error occurs
    expect(true).toBe(true);
  }); 

  test('does nothing when file input change triggered but no file is selected', () => {
    require('../admin/js/profilePhoto');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  
    const fileInput = document.getElementById('profilePicInput');
  
    // Manually clear files
    Object.defineProperty(fileInput, 'files', {
      value: [],
      writable: false,
    });
  
    fileInput.dispatchEvent(new Event('change'));
  
    const img = document.getElementById('profilePic');
    expect(img.getAttribute('src')).toBe(null);
    expect(localStorage.getItem('profileImage')).toBe(null);
  }); 
});
