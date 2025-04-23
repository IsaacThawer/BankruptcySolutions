/**
 * @jest-environment jsdom
 */

const { fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');

beforeAll(() => {
  // Stub fetch so it always returns an object with .json() and .text()
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ text: 'dummy' }),
    text: async () => 'dummy'
  });
  // Stub saveText (used by the click handler)
  global.saveText = jest.fn().mockResolvedValue();
});

describe('loadText(contID, filename) & updateServiceDescription(chapter)', () => {
  let loadText, updateServiceDescription;

  beforeAll(() => {
    // Import once for the pure-unit tests
    const mod = require('../admin/js/read-script.js');
    loadText = mod.loadText;
    updateServiceDescription = mod.updateServiceDescription;
  });

  beforeEach(() => {
    fetch.mockClear();
    document.body.innerHTML = '';
  });

  it('loadText: fetches JSON and populates innerHTML', async () => {
    document.body.innerHTML = '<div id="foo"></div>';
    fetch.mockResolvedValueOnce({
      json: async () => ({ text: 'Hello World' })
    });

    await loadText('foo', 'bar.json');

    expect(fetch).toHaveBeenCalledWith('/admin/content/bar.json', { method: 'GET' });
    expect(document.getElementById('foo').innerHTML).toBe('Hello World');
  });

  it('loadText: throws if element not found', async () => {
    // no #foo in DOM
    await expect(loadText('foo', 'bar.json')).rejects.toThrow();
  });

  it('updateServiceDescription: sets innerText when element exists', async () => {
    // create <p id="servicesX">
    const p = document.createElement('p');
    p.id = 'servicesX';
    document.body.appendChild(p);

    fetch.mockResolvedValueOnce({
      text: async () => 'Details for X'
    });

    await updateServiceDescription('X');

    expect(fetch).toHaveBeenCalledWith('/admin/content/services-X.json');
    expect(p.innerText).toBe('Details for X');
  });

  it('updateServiceDescription: resolves without fetch if element missing', async () => {
    // no matching <p>
    await expect(updateServiceDescription('Y')).resolves.toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('DOMContentLoaded handler & change event', () => {
  let originalGetElementById;

  beforeEach(() => {
    fetch.mockClear();

    // Minimal DOM with only the IDs your tests care about
    document.body.innerHTML = `
      <div id="home-page-title"></div>
      <select id="home-page-services-selection">
        <option value="Chapter7"></option>
        <option value="Chapter11"></option>
      </select>
      <textarea id="home-page-services"></textarea>
      <button id="update-services-button"></button>
      <p id="services-Chapter7"></p>
    `;

    // Stub document.getElementById so loadText never sees null
    originalGetElementById = document.getElementById.bind(document);
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      const found = originalGetElementById(id);
      if (found) return found;
      // otherwise create a dummy <div> so loadText can set innerHTML without error
      const dummy = document.createElement('div');
      dummy.id = id;
      document.body.appendChild(dummy);
      return dummy;
    });

    // Re-load the module in isolation so its DOMContentLoaded listener
    // picks up our stubbed getElementById
    jest.isolateModules(() => {
      require('../admin/js/read-script.js');
    });
  });

  afterEach(() => {
    document.getElementById.mockRestore();
  });

  it('on DOMContentLoaded, fires fetch for title and default Chapter7', () => {
    window.dispatchEvent(new Event('DOMContentLoaded'));

    expect(fetch).toHaveBeenCalledWith('/admin/content/index-title.json',     { method: 'GET' });
    expect(fetch).toHaveBeenCalledWith('/admin/content/services-Chapter7.json',{ method: 'GET' });
  });

  it('changing the chapter dropdown fetches the new services JSON', () => {
    window.dispatchEvent(new Event('DOMContentLoaded'));
    fetch.mockClear();

    const select = document.getElementById('home-page-services-selection');
    select.value = 'Chapter11';
    fireEvent.change(select);

    expect(fetch).toHaveBeenCalledWith('/admin/content/services-Chapter11.json', { method: 'GET' });
  });
});
