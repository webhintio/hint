# Network utils (`@hint/utils-network`)

Set of helpers for network.

## Installation

This package is installed automatically when adding webhint to your project
so running the following is enough:

```bash
npm install hint --save-dev
```

## Utils

* `asPathString`: Returns the pathname of a URL, normalizing depending
on the platform.
* `getAsUri`: Receives a string and returns a valid Uris
* `getAsUris`: Receives an array of string and returns an array of valid Uris.
* `hasProtocol`: Convenience function to check if a resource uses a specific
protocol.
* `includedHeaders`: Returns a list of all the headers in `headerList`
that are in `headers` sorted alphabetically.
* `isDataURI`: Convenience function to check if a resource is a data URI.
* `isHTMLDocument`: Convenience function to check if a resource is a
HTMLDocument.
* `isHTTP`: Convenience function to check if a resource is served over HTTP.
* `isHTTPS`: Convenience function to check if a resource is served over HTTPS.
* `isLocalFile`: Convenience function to check if a resource is a local file.
* `isRegularProtocol`: Convenience function to check if a uri's protocol
is http/https if specified.
* `normalizeHeaderValue`: Remove whitespace from both ends of a header value
and lowercase it.
* `requestAsync`: Convenience wrapper for asynchronously request an URL.
* `requestJSONAsync`: Request response in the json format from an endpoint.
* `rxLocalhost`: RegExp to test if a resource points to localhost.
