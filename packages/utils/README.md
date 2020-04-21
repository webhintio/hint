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

### logger

* `error`: Cover for console.error.
* `log`: Cover for console.log.
* `warn`: Cover for console.warn.

### misc

* `askQuestion`: Asks a y/n question to the user defaulting to Yes.
* `delay`: Convenience wrapper to add a delay using promises.
* `mergeEnvWithOptions`: Merges any `webhint_` prefixed environment
  variable available with the given `options` object.

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
