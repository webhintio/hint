# Development flow integration

`webhint` can be used at different steps of the development flow. The
following is a guide that ilustrates some of this scenarios and how can
they be achieved. If you have another scenario that is not in here, please
open an issue [on webhint's GitHub repo][webhint github] so we can
investigate how to support it:

* [Local server][local server]: Test a local instance of your website.
* [Travis CI and Azure Web App][travis azure]: Publish to an staging
  environment and automatically deploy to production if there are not any
  problems.

The recommended way to install `webhint` for all these scenarios is as a
`devDependency` (`npm install hint --save-dev`) and that's what it's
assumed in the guides.

<!-- Link labels: -->

[local server]: ./local-server.md
[travis azure]: ./travis-and-azure.md
[webhint github]: https://github.com/webhintio/hint/issues/new
