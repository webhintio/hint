# Formatters

A `formatter` takes the results of executing the configured rules and
transforms them to be consumed by the user. A `formatter` can output
the results via the `console` in different formats, a `JSON` file,
`XML`, etc.

You can specify one or more `formatter`s as the output. E.g.: You want
a summary in the screen as well as a text report. You just need to
add the name inside the property `formatters`:

```json
{
    "formatters": "formatter1"
}
```

or

```json
{
    "formatters": [
        "formatter1",
        "formatter2"
    ]
}
```

## List of official `formatter`s

The built-in `formatter`s are:

* `json` does a `JSON.stringify()` of the results. Output
  is not user friendly:

![Example output for the json formatter](images/json-output.png)

* `stylish` prints the results in table format indicating the resource,
  line, and column:

![Example output for the stylish formatter](images/stylish-output.png)

* `codeframe` shows also the code where the error was found if: Will
  show the piece of code where the error was found (if applicable):

![Example output for the codeframe formatter](images/codeframe.png)

* `summary` shows just a summary of all the warnings and errors found
  for all the resources:

![Example output for the summary formatter](images/summary-output.png)

If you want to implement your own `formatter`, visit the [contributor
guide][contributor guide]

<!-- Link labels: -->

[contributor guide]: ../../../contributor-guide/formatters/
