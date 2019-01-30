declare const browser: typeof chrome;

// Normalize access to extension APIs across browsers.
const _browser: typeof chrome = typeof browser !== 'undefined' ? browser : chrome;

// Include references to web browser globals to facilitate mocks during testing.
const _document = document;
const _eval = eval; // eslint-disable-line no-eval
const _fetch = fetch;
const _localStorage = localStorage;
const _location = location;
const _window = window;

export {
    _browser as browser,
    _document as document,
    _eval as eval,
    _fetch as fetch,
    _localStorage as localStorage,
    _location as location,
    _window as window
};
