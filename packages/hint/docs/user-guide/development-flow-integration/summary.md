# Development flow integration

`webhint` can be used at different steps of the development flow. The
following are guides that illustrate some of these scenarios and how they
can be achieved. If you have another scenario that is not in here, please
open an issue [in the `webhint` GitHub repo][webhint github] so we can
investigate how to support it.

Basic guides:

* [Local server][local server]: Test a local instance of your website.
* [CircleCI][circleci]
* [TravisCI][travisci]

In-depth guides:

* [Travis CI and Azure Web App][travis azure]: Publish to a staging
  environment and automatically deploy to production if there are no issues.

The recommended way to install `webhint` for all these scenarios is as a
`devDependency` (`npm install hint --save-dev`) and that's what it's
assumed in the guides.

<!-- Link labels: -->

[circleci]: ./circleci.md
[local server]: ./local-server.md
[travis azure]: ./travis-and-azure.md
[travisci]: ./travisci.md
[webhint github]: https://github.com/webhintio/hint/issues/new
