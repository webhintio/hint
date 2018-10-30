declare const browser: typeof chrome;

// Normalize access to extension APIs across browsers.
const b = typeof browser !== 'undefined' ? browser : chrome;

export default b;
