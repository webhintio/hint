/**
 * RegExp to test if a resource points to the local host.
 * Identifies both localhost and 127.0.0.1 URLs.
 */
export const rxLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)[:/]/;
