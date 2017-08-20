# List of official formatters

The current supported `formatter`s are:

* `json` does a `JSON.stringify()` of the results. Output
  is not user friendly:

![Example output for the json formatter](./json-output.png)

* `stylish` prints the results in table format indicating the resource,
  line, and column:

![Example output for the stylish formatter](./stylish-output.png)

* `codeframe` shows also the code where the error was found if: Will
  show the piece of code where the error was found (if applicable):

![Example output for the codeframe formatter](./codeframe.png)
