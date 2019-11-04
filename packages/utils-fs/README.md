# FileSystem utils (`@hint/utils-fs`)

Set of helpers to work with the filesystem.

## Installation

This package is installed automatically when adding webhint to your project
so running the following is enough:

```bash
npm install hint --save-dev
```

## Utils

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
