# String utils (`@hint/utils-string`)

Set of helpers to process string.

## Installation

This package is installed automatically when adding webhint to your project
so running the following is enough:

```bash
npm install hint --save-dev
```

## Utils

* `cutString`: Cut a given string adding `…` in the middle.
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
