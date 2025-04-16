const { loadText, initLoadText } = require('../public/js/read-script.js');

describe('loadText', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="test-container"></div>';
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ text: 'Test content loaded' })
            })
        );
    });

    it('fetches the JSON file and updates the DOM element with the text', async () => {
        await loadText('test-container', 'test-file.json');
        expect(document.getElementById('test-container').innerHTML).toBe('Test content loaded');
        expect(fetch).toHaveBeenCalledWith('/admin/content/test-file.json', { method: 'GET' });
    });
});

describe('initLoadText', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="introduction"></div>
            <div id="title"></div>
            <div id="contact"></div>
            <div id="services1"></div>
            <div id="review1"></div>
            <div id="reviews-header"></div>
            <div id="review2"></div>
            <div id="review3"></div>
            <div id="g-review1"></div>
            <div id="services-Chapter7"></div>
            <div id="services-Chapter11"></div>
            <div id="services-Chapter12"></div>
            <div id="services-Chapter13"></div>
            <div id="service-benefits"></div>
            <div id="why-choose-us"></div>
            <div id="about-us"></div>
            <div id="about-meet-eric"></div>
            <div id="about-erics-role"></div>
            <div id="about-education"></div>
            <div id="about-client-commitment"></div>
        `;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ text: 'Test content loaded' })
            })
        );
    });

    it('calls fetch for each expected file', async () => {
        await initLoadText();
        expect(fetch).toHaveBeenCalledTimes(21); // 21 total calls
    });
    describe('module exports', () => {
        it('should export loadText and initLoadText when in Node environment', () => {
            // Simulate a CommonJS environment
            const moduleBackup = global.module;
            global.module = { exports: {} };
    
            const exported = require('../public/js/read-script.js');
            expect(typeof exported.loadText).toBe('function');
            expect(typeof exported.initLoadText).toBe('function');
    
            global.module = moduleBackup; // Restore if needed
        });
    });
    
});
