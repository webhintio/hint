# Developer guide

`sonar` was designed with extensibility in mind. There are 3 main
concepts that a developer needs to know about:

* `rule`: Is a test that is run on an asset (website, HTML file,
  image, request, etc.). E.g.: Verify that the HTML document has
  a valid language declared.
* `collector`: Is the way in which `sonar` obtains information about
  the DOM, requests, assets, etc. The underlying technique (debugging
  protocol, web driver, etc.) to access this data does not matter to
  the rest of the system.
* `formatter`: Transforms the results into something useful to the
  user. It could be as simple as printing out the results in the
  command line, or something more complex like creating an HTML report.

Any developer can create their own `rule`s, `collector`s, and/or
`formatter`s, and use them without having to do a Pull Request to the
main project. They can even be distributed as [`npm`](https://www.npmjs.com/)
packages.

Even though sonar is developed using [TypeScript](https://www.typescriptlang.org/),
there is no need for it if you are writting your own `rule`, `collector`
or `formatter`. Just follow the examples for each area and you should
be good.
