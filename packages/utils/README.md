# Utils (`@hint/utils`)

Set of tools for hint.

## Installation

To install the package, you need to run:

```bash
npm install @hint/utils
```

## Tools

The tools included in this package are:

* `asyncTry`: Wrap an async function, returning null if the evaluation throws
and exception.
* `debug`: Initialize the debug messaging system.
* `get-hints-from-extends`: Returns all hints in a configuration, including
hints inside the extended configurations.

### appInsights

* `isEnabled`: Check if Application Insights is enabled or not.
* `enable`: Enable Application Insight.
* `disable`: Disable Application Insights for the future.
* `sendPendingData`: Send pending data to Application Insights.
* `trackException`: Track an exception in Application Insights.
* `trackEvent`: Track an event in Application Insights.
* `getClient`: Return the Application Insights client.
* `isConfigured`: Check if Application Insights is configured.

### compat

* `getFriendlyName`: Get the friendly name of a browser from an id.
* `getUnsupported`: Get browsers without support for CSS or HTML features.
* `getUnsupportedDetails`: Get browsers without support with details on
  when support was added or removed.
* `isSupported`: Query MDN for support of CSS or HTML features.

### configStore

* `get`: Get the value from the config store.
* `set`: Set a value in the config store.

### contentType

* `determineMediaTypeBasedOnFileExtension`: Get a mime-type associated
  with the specified file extension.
* `determineMediaTypeBasedOnFileName`: Get a mime-type associated with
  the specified filename.
* `determineMediaTypeForScript`: Check if the provided mime-type is a
  recognized mime-type for JavaScript, returning the recommended
  mime-type if so, `null` otherwise.
* `getContentTypeData`: Try to determine the correct mime-type for a
  response.
* `getFileExtension`: Try to determine a resource's file extension.
* `getType`: Returns the group to which the mediaType belongs to. E.g.:
  `image`, `font`, `script`, `css`, `html`, `manifest`, `xml` or
  `unknown`.
* `isTextMediaType`: Check if a mime-type represents a text-based
  resource.

### chromiumFinder

* `Browser`: An enum with the Chromium based browsers supported: Chrome,
  Chromium, and Edge.
* `getInstallationPath`: Searchs for a valid Chromium browser from the ones
  supported. The current priority list is:
  * `Chrome Canary`, `Chrome`, `Chromium`, `Edge Canary`, `Edge Dev` (`Edge`
  on `win32` and `darwin` platforms). A user can also pass the browser to use
  (`Chrome`, `Chromium`, `Edge`) via the `options` parameter
  (`options.browser`) or a `path` to the executable (`options.browserPath`) to
  use (`getInstallationPath` will only verify it exists, not if it's actually
  a valid target).

### dom

* `createHTMLDocument`: Create an HTMLDocument object from an string.
* `findOriginalElement`: Perform a best-effort search to find an element in
the provided document which is likely the original source for the provided
element. Used to resolve element locations to the original HTML when possible.
* `getElementByUrl`: Get an HTMLElement given a URL.
* `traverse`: Traverse an HTMLDocument.
* `HTMLDocument`: Class representing a HTMLDocument.
* `HTMLElement`: Class representing a HTMLElement.

### fs

* `cwd`: Returns the current working directory. Same as `process.cwd()`.
* `fileExtension`: Try to determine the resource's file extension.
* `fileName`: Returns the name of a file. Same as `path.basename()`.
* `isDirectory`: Check if a path is a directory and exists.
* `isFile`: Check if a path is a file and exists.
* `loadJSFile`: Loads a JavaScript file.
* `loadJSONFile`: Loads a JSON a file.
* `pathExists`: Check if a path exists.
* `readFileAsync`: Convenience wrapper for asynchronously reading file
contents.
* `readFile`: Convenience wrapper for synchronously reading file contents.
* `writeFileAsync`: Convenience wrapper for asynchronously write a file.

### logger

* `error`: Cover for console.error.
* `log`: Cover for console.log.
* `warn`: Cover for console.warn.

### misc

* `askQuestion`: Asks a y/n question to the user defaulting to Yes.
* `cutString`: Cut a given string adding `…` in the middle.
* `delay`: Convenience wrapper to add a delay using promises.
* `mergeEnvWithOptions`: Merges any `webhint_` prefixed environment
  variable available with the given `options` object.
* `mergeIgnoreIncludeArrays`: Adds the items from  `includeArray` into
`originalArray` and removes the ones from `ignoreArray`.
* `normalizeIncludes`: Return if normalized `source` string includes
normalized `included` string.
* `normalizeStringByDelimiter`: Normalize String and then replace characters
with delimiter.
* `normalizeString`: Remove whitespace from both ends of a string and
lowercase it.
* `prettyPrintArray`: Returns an array pretty printed.
* `toCamelCase`: Convert '-' delimitered string to camel case name.
* `toLowerCaseArray`: Lower cases all the items of `list`.
* `toLowerCaseKeys`: Returns the same object but with all the properties
lower cased.
* `toPascalCase`: Convert '-' delimitered string to pascal case name.

### network

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

### npm

* `installPackages`: Install the given packages.
* `search`: Searches all the packages in npm given `searchTerm`.
* `getOfficialPackages`: Get core packages from npm.
* `getUnnoficialPackages`: Get external packages from npm.

### packages

* `findNodeModulesRoot`: Find the node_modules folder where hint is installed
as a dependency or returns the hint node_modules folder if not.
* `findPackageRoot`: Searches for the first folder that contains the
`fileToFind` going up the tree.
* `isOfficial`: Returns if the hint that is going to be created is an
official.
* `loadPackage`: Returns the package found in the given `pathString` or an
exception if no package is found.
* `hasMultipleResources`: Returns true if a hint package is a multi-hint.
* `isFullPackageName`: Returns true if the name is a full package name.
* `loadHintPackage`: Returns the package `hint`.
* `loadResource`: Returns a resource if it exists.
* `requirePackage`: Require a package, compatible with webpack.

### report

* `getCSSCodeSnippet`: Generate a Snippet code for a CSS node.
* `getHTMLCodeSnippet`: Generate a Snippet code for a HTMLElement.

### test

* `generateHTMLPage`: Creates a valid minimal HTML.
* `getHintPath`: Returns the name of the hint.
