# The release process

The repo [hint][hint] is a monorepo. This means it contains several packages under the same source control so it is easier to update them. In this case all those packages are under the `packages` folder: main CLI, `hint`s, `connector`s, `formatter`s, `configuration`s, etc. Everything maintained by the team lives there.

The piece that makes this possible is [`yarn`][yarn] and its [`workspaces`][yarn-workspaces].

The team deeply believes in automation, and the release process is part of this: Bumping
to new versions, update local dependencies, publishing to npm... Everything is automated or at least partially. Unfortunatelly, this is not an easy task and there are several things that can cause trouble:

* `yarn` and `npm` do not produce the same output
* Knowing exactly how to bump a version, especially when dealing with dependencies, can be complex
* Commit messages are not always acurate
* There can be circular references (e.g.: `hint` and `configuration-web-developement`)

This text aims to document what the release process should be under any circumstance.

## Bump version strategy

Commit messages are used to know how to bump the version of a package:

* Docs: no version change, related to `.md` changes
* Build: no version change, related to build and release scripts
* Chore: refactoring, tests, etc. anything not user-facing will be a `patch` (x.x.X)
* Upgrade: dependency updates with no public API changes are a `patch` (x.x.X)
* Fix: bug fixes are a `patch` (x.x.X)
* New: added functionality that does not break previous behavior is a `minor` (x.X.x)
* Breaking: any change to the public API or output (like error messages) is a `major` (X.x.x)

## Scenarios




|               | cli | hint | parser | connector | utils | configuration |
|---------------|-----|------|--------|-----------|-------|---------------|
| cli           |     |      |        |           |       |               |
| hint          |     |      |        |           |       |               |
| parser        |     |      |        |           |       |               |
| connector     |     |      |        |           |       |               |
| utils         |     |      |        |           |       |               |
| configuration |     |      |        |           |       |               |




<!-- link labels -->
[hint]: https://github.com/webhintio/hint
[yarn]: https://yarnpkg.com
[yarn-workspaces]: https://yarnpkg.com/lang/en/docs/workspaces/