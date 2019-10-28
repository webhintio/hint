# Hints timeout

Even though hints are executed in parallel, sometimes one can take
too long and prevent `webhint` to finish (e.g.: when using an external
service, long script execution, etc.).

To prevent this situation, each hint needs to finish in under 2 minutes.
You can modify this threshold by using the property `hintsTimeout` in
your `.hintrc` file. Value should be in milliseconds.

```json
{
    "connector": {
        "name": "jsdom"
    },
    "formatters": ["stylish"],
    "hintsTimeout": 120000,
    "hints": {
        // ...
    }
}
```
