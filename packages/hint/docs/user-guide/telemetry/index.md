# Telemetry

## What are we tracking

The first time you run `webhint` we will ask you if you want to send us
`limited usage information` to help us to build a better product.

If you answer `yes`, you will grant permission to `webhint` to send the
following information:

* The configuration used.
* Missed or incompatible packages.
* When a new hint is created using `npm create hint`.
* When there is an error creating a hint using `npm create hint`.
* The configuration created using `npm create hintrc`.
* When a parser is created using `npm create parser`.
* Unhandled/Uncaught exceptions when runing `webhint`.

If you want to set up the tracking information from the command line you have
two options:

* Run `webhint` with the parameter `--tracking=on|off`.
  > E.g.: hint http://example.com --tracking=on
* Configure an environment variable `HINT_TRACKING` with the
  value `on` or `off`.

In case you are using both of them, `--tracking on|off` will have
higher priority.

If you want to see a log in your console about what information `webhint` is
tracking, you can use the parameter `--analytics-debug`.

>E.g.: hint http://example.com --analytics-debug