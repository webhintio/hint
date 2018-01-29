# Architecture

`sonarwhal` was designed with extensibility in mind. There are four main
concepts that you as a developer need to know about:

DIAGRAM OF HOW THINGS INTERACT WITH EACH OTHER

* `rule`: Is a group of related tests that are run on aa resource
  (website, HTML document, image, request, etc.). E.g.: Verify that the
  HTML document has a valid language declared.
* `connector`: Is the way in which `sonarwhal` obtains information about
  the DOM, requests, assets, etc. The underlying technique (debugging
  protocol, web driver, etc.) to access this data does not matter to
  the rest of the system.
* `formatter`: Transforms the results into something useful to the
  user. It could be as simple as printing out the results in the
  command line, or something more complex like creating an HTML report.
* `parser`: TBD

Any developer can create their own `rule`s, `connector`s, `parser`s
and/or `formatter`s, and use them without having to do a Pull Request to
the main project. They can even be distributed as [`npm`][npm] packages.

~~Even though `sonarwhal` is developed using [`TypeScript`][typescript],
there is no need for it if you are writting your own `rule`, `connector`
or `formatter`. Just follow the examples for each area and you should
be good.~~

<!-- Link labels: -->

[npm]: https://www.npmjs.com/
[typescript]: https://www.typescriptlang.org/
