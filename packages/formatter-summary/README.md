# Formatter summary (`@sonarwhal/formatter-summary`)

The `summary` formatter prints the results of a site analysis in a table with how many errors or warnings a rule has found:

![Example output for the summary formatter](images/summary-output.png)

To use it you need to configure your `.sonarwhalrc` file as follows:

```json
{
    "formatters": "summary"
}
```
