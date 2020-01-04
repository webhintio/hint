# JSON utils (`@hint/utils-json`)

Set of helpers to process JSON.

## Installation

This package is installed automatically when adding webhint to your project
so running the following is enough:

```bash
npm install hint --save-dev
```

## Utils

* `finalConfig`: Calculate the final configuration taking into account the
  extend property.
* `parseJSON`: Parse a json string.
* `loadJSONFile`: Loads a JSON a file.
* `JSONLocationOptions`: Type representing the options for the location.
* `JSONLocationFunction`: Type representing the options for the location
  function.
* `IJSONResult`: Interface for a JSONResult.
* `ExtendableConfiguration`: Type representing a extendable configuration.
* `IParsingError`: Interface for an error parsing.
* `ISchemaValidationError`: Interface for an error validating a json.
* `SchemaValidationResult`: Type representing the result of a json validation.
* `GroupedError`: Type representing a group of errors validating a json.
* `validate`: Validate a json given a schema.
