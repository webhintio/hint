# Rules timeout

Even though rules are executed in parallel, sometimes one can take too
long and prevent `sonarwhal` to finish (e.g.: when using an external service,
long script execution, etc.).

To prevent this situation, each rule needs to finish in under 2 minutes.
You can modify this threshold by using the property `rulesTimeout` in
your `.sonarwhalrc` file. Value should be in milliseconds.

```json
{
    "connector": {
        "name": "jsdom"
    },
    "formatters": "stylish",
    "rulesTimeout": 120000,
    "rules": {
        // ...
    }
}
```
