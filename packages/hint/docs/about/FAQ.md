# FAQ

## What is webhint?

`webhint` is a linting tool for the web, with a strong focus on the
developer experience: easy to configure, develop, and well documented.

`webhint` doesn’t want to reinvent the wheel. For that reason it tries
to integrate other tools and services that do a great job, and
contribute back where appropriate. For example, we are using [axe][axe]
for accessibility, [SSL Server Test][ssllabs] for checking the
certificate configuration, etc.

## What is webhint’s goal?

We have a few:

* Bring the community together to decide what best practices are
  in several areas.
* Help web developers write the best possible code.
* Clean up the web of bad practices.
* Promote community tools and services that do an awesome job but
  could not be known by everybody.

## Who started webhint?

`webhint`’s development started inside the Microsoft Edge team. Early on,
the team realized that not only the project had to be open source, but
also be community driven. The best way to achieve that was by donating
the code to the JS Foundation, have a governance model that welcomes
input for anyone in the web community (browser vendors, web experts,
and developers), and continue the work there.

## What can I do to help?

There are lots of things you can do to make `webhint` better, from
reviewing documentation, writting new one, filling bugs, triaging,
coding, etc.

We will gladly accept any contribution you can do. Most of the
[issues in `webhint`][issues] should have a difficulty level.
Also don’t hesitate to ask for help.

## What browsers are supported?

A [developer tools extension][extension-browser] is available for
Chrome, Edge (Chromium), and Firefox. The `webhint` CLI can be run
against [jsdom][connector jsdom] or any browser supported by
[puppeteer][connector puppeteer]. If your favorite browser is not
supported you can always [develop a connector][connector docs] for it!

## Is there a plugin for my favorite editor?

A [webhint extension][extension-vscode] for Visual Studio Code is
currently available. It utilizes the [Language Server Protocol][lsp]
which makes it suitable for porting to other editors if there's
community interest.

## Is there an online service?

Yes! You can scan an online website in [here][scanner].

If you have any feedback on the results page, please open an
issue in the [website repository][scanner-issues]. If the issue is
related to the results themselves, then open an issue in the [webhint
repository][webhint-issues].

## What is the logo?

Our logo is Nellie the narwhal. Narwhals are not only [awesome][narwhal
song] but have one of the best sonars in the animal kingdom.

[Narwhal echolocation beams may be the most directional of any
species][narwhal echolocation].

> Recordings of narwhal (Monodon monoceros) echolocation signals were
> made using a linear 16 hydrophone array in the pack ice of Baffin Bay,
> West Greenland in 2013 at eleven sites. An average -3 dB beam width
> of 5.0° **makes the narwhal click the most directional biosonar signal
> reported for any species to date.**

## I don’t agree with one of your hints, how can I tell you?

Great, let’s make it better! You can [open an issue here][new issue]
telling us what you think can be improved.

<!-- Link labels: -->

[axe]: https://axe-core.org/
[connector docs]: https://webhint.io/docs/contributor-guide/how-to/connector/
[connector jsdom]: https://webhint.io/docs/user-guide/connectors/connector-jsdom/
[connector puppeteer]: https://webhint.io/docs/user-guide/connectors/connector-puppeteer/
[extension-browser]: https://webhint.io/docs/user-guide/extensions/extension-browser/
[extension-vscode]: https://marketplace.visualstudio.com/items?itemName=webhint.vscode-webhint
[issues]: https://github.com/webhintio/hint/issues
[lsp]: https://microsoft.github.io/language-server-protocol/
[narwhal echolocation]: http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0162069
[narwhal song]: https://www.youtube.com/watch?v=ykwqXuMPsoc
[new issue]: https://github.com/webhintio/hint/issues/new
[scanner]: https://webhint.io/scanner/
[scanner-issues]: https://github.com/webhintio/webhint.io/issues/new
[webhint-issues]: https://github.com/webhintio/hint/issues/new
[ssllabs]: https://www.ssllabs.com/ssltest/
