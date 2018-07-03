# Using relative resources

You can use relative resources in your `.hintrc` file:

```json
{
    "connector": {
        "name": "../my-connector/connector.js"
    },
    "formatters": ["../../formatters/my-formatter.js"],
    "hints": {
        "../my-hint/hint.js": "error"
    },
    "hintsTimeout": 120000
}
```

Some things to keep in mind:

* Only relative paths to the config file are supported.
* Regardless of your OS you have to use `/` as the separator.
* The resource will be resolved relatively to where the config file that
  needs the resource is. This is important if you are extending configurations.
