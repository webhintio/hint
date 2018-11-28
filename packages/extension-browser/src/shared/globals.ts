declare const browser: typeof chrome;

// Normalize access to extension APIs across browsers.
const b: typeof chrome = typeof browser !== 'undefined' ? browser : chrome;

// Include references to web browser globals to facilitate mocks during testing.
const d = document;
const e = eval; // eslint-disable-line
const f = fetch;
const l = location;
const w = window;

export {
    b as browser,
    d as document,
    e as eval,
    f as fetch,
    l as location,
    w as window
};
