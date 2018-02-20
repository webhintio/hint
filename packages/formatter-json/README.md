# Formatter json (`@sonarwhal/formatter-json`)

The `json` does a `JSON.stringify()` of the results. Output is not very user
friendly:

![Example output for the json formatter](images/json-output.png)

To use it you need to configure your `.sonarwhalrc` file as follows:

```json
{
    "formatters": "json"
}
```
