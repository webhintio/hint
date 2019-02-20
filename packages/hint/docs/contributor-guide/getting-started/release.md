# 🚀 Release process automation and improvements

**STATUS: WORK IN PROGRESS**

## Background

[hint][hint] is a monorepo. This means it contains several packages under the same source control so it is easier to update them. In this case all those packages are under the `packages` folder: main CLI, `hint`s, `connector`s, `formatter`s, `configuration`s, etc. Everything maintained by the team lives there.

Releasing a monorepo following `semver` can be a challenge. How to bump versions? How to deal with circular dependencies?

This document aims to detail what webhint's current release process does, what are the pain points, and a proposal on how to aleviate them.

## Bump versioning using commit tags

Commit messages are used to decide how to bump the package's version:

* `Docs:` no version change, related to `.md` changes
* `Build:` no version change, related to build and release scripts
* `Chore:` refactoring, tests, etc. anything not user-facing will be a `patch` version change (x.x.X)
* `Upgrade:` dependency updates with no public API changes are a `patch` version change (x.x.X)
* `Fix:` bug fixes are a `patch` version change (x.x.X)
* `New:` added functionality that does not break previous behavior is a `minor` version change (x.X.x)
* `Breaking:` any change to the public API or output (like error messages) is a `major` version change (X.x.x)

## Automatic bump versioning of local dependencies

The release process updates local dependencies directly using `Upgrade` in the commit message. The reason is that [no code changes are needed to upgrade thus a `patch`](https://semver.org/#what-should-i-do-if-i-update-my-own-dependencies-without-changing-the-public-api). If any code modification is required it should be done prior running the release script.

**⁉️ NOTE**: Publishing a new version shouldn't be done if the only change since it was last published is an `Upgrade` of dependency(ies).

Let's imagine we have `packageB`, v1.5.0, that depends on `packageA`, v1.0.5. The following are some scenarios of what should be done:

### No public changes

* `packageA` adds support for something new → `New: Support for this new thing`.
* `packageB` needs `packageA`'s new feature to fix something that was broken → `Fix: This nasty bug`.

The release script will:
* release `packageA` with a `minor` bump: version 1.1.0.
* add a new commit to `packageB`: `Upgrade: Bump packageA to 1.1.0`. Because the commit history has `Fix` and `Upgrade`, `packageB` will be bumped to 1.5.1 (`Fix` == `Upgrade`).

Let's use a more concrete example:

`utils-create-server` switches their API to spawn a new process per server and makes all its API `async`. This is a breaking change so it should be noted as `Breaking: Make API async`. The release script will bump it to the next major version, so if previously it was `3.2.1`, it should be updated to `4.0.0`. At the same time we do this breaking change we want to update the packages that depend on it:

| Dependency |
|------------|
| @hint/connector-chrome |
| @hint/connector-jsdom |
| @hint/extension-browser |
| @hint/utils-connector-tools |
| @hint/utils-tests-helpers |

The interaction in each package with `utils-create-server` needs to be updated, but nothing changes externally so the commit to make those changes should be `Upgrade: Update to new utils-create-server interface`. Let's pick `utils-tests-helpers` and assume the current version is `2.0.1` and its `package.json` could look like:

```json
{
    ...
    "dependencies": {
        ...
        "@hint/utils-create-server": "^3.2.1"
        ...
    },
    "version": "2.0.1"
}
```

After the release script it will look like:

```json
{
    ...
    "dependencies": {
        ...
        "@hint/utils-create-server": "^4.0.0"
        ...
    },
    "version": "2.0.2"
}
```

This is fine because of the way `semver` works. Version `2.0.1` and prior will download the latest `3.2.x` version of `@utils/create-test-server`. Version `2.0.2` and later will download `4.0.x`.

Now that `@hint/utils-test-server` has been updated, what happens to all the other packages? The dependency will be updated but no version will be published because there will be only one `Upgrade` commit in the history. Those packages have a dependency such as:

```json
"@hint/utils-test-server": "^2.0.1"
```

When someone installs the package from a clean cache, version `2.0.2` will be downloaded among the latest `@hint/utils-create-server"`. This version is fully compatible with the current code.

### New feature

* `packageA` breaks something → `Breaking: Drastic change in the API`.
* `packageB` updates the code to adapt to `packageA`'s new API and it can now support a new feature → `New: Shiny feature`.

The release script will:
* releases `packageA` with a `major` bump: version 2.0.0.
* add a new commit to `packageB`: `Upgrade: Bump packageA to 2.0.0`. Because the commit history has `New` and `Upgrade`, `pakageB` will be bumped to 1.6.0 (`New` > `Upgrade`).

**⁉️ NOTE**: When looking at the commit history it might be surprising to see something like the following (from newer to older):

```
Upgrade: Bump packageA to 2.0.0
New: This shiny new feature
```

instead of the reverse. Because of the way that monorepos work this is actually expected. Also this will be "hidden" from the changelog as `Upgrade:` and `Chore:` are not outputed in the process.

### Breaking change

* `packageA` breaks something → `Breaking: Drastic change in the API`.
* `packageB` changes also needs to change completely to make sure how everything works → `Breaking: Drastic change in the API`.

The release script will:
* releases `packageA` with a `major` bump: version 2.0.0.
* add a new commit to `packageB`: `Upgrade: Bump packageA to 2.0.0`. Because the commit history has `Breaking` and `Upgrade`, `packageB` will be bumped to 2.0.0 (`Breaking` > `Upgrade`).

E.g.: If the package `hint` expects the resources (`hint`s, `parser`s, etc.) to change their interface, updating should be a `Breaking` change.

**⁉️ NOTE**: `packageA` commit could be anything, the important part is how the changes are handled in `packageB` and how they are commited. It is very tempting to do all the changes in one single commit but this could have very bad consequences (e.g.: bumping all packages by a `major` version when it should be a `patch`).

## Current release process

The previous is implemented (more or less accurate) during the release process. To start a new release a user needs to run `npm run release` that executes `scripts/release.ts`. The gist is:

1. Calculate what packages need to be published. To achieve this, the script searches the latest tag for each package and checks if there have been any commits since then that affect it.
1. Sort the dependencies by less dependants, i.e. if `packageA` depends on `packageB` it will work on `packageB` first.
1. For each package:
   * Bump the `version` in the `package.json` of the package using the related commit message(s) and update `CHANGELOG.md`
   * Clean the package, intall dependencies via `npm`, and run `npm run test-release`
   * Publish the new package to npm
   * Update references from other packages
   * Publish changes into GitHub

This script also takes care of removing the `private` property from `package.json`, initializes a new `CHANGELOG.md` if needed, downloads files that are updated elsewhere like snyk's database, and such.

## Current problems

While the current process works most of the times OK, there are a few things that could be improved:

* Using `tag`s to calculate the list of changes is not reliable. The team has experienced issues with tags being different accross forks, and such.
* Installing each package individually is a slow process. There used to be problems with dependencies missing and such, that can probably be avoided with the right tooling.

  In the past, we had problems with dependencies declared in one `package.json` being found in other packages. This happened due to workspaces hoisting the dependencies.
* Another issue using npm to install the dependencies of each package individually is that the packages need to be published in the right order and npm needs to be updated so there isn't any problem requesting the dependency. There have been instances where npm's index wasn't yet updated and the process crashed because the wanted version wasn't available. Another big issue with this approach is that there is currently a circular dependency that if not handled correctly could cause an infinite publish loop.
* Because each package is tested individually when doing the release (contrary to testing everything first before releasing) the release process might stop in the middle because one of the packages fails for whatever reason.
* It's not clear how to prevent publishing a package, the script seems to remove the `private` property and I couldn't find any `ignorePackages` or similar in the code.
* The script has never been run to its end successfully on Windows and testing changes is complicated.
* The release can not be fully automated. It uses OTP for GitHub and npm and doesn't take into account other type of authentication mechanisms.
* Other minor issues like can't continue even if tests fail, auto approve changelog, release an specific package, etc.

### More about circular dependencies

webhint has a circular dependency via `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`. The circle is as follows (`https-only` is used as an example but it could be any `hint` in `configuration-web-recommended`):

`configuration-web-recommended`

→ `https-only` (`dependencies`)

→ `hint` (`peerDependencies`, `devDependencies`)

→ `configuration-web-recommended` (`optionalDependency`)

Right now it is not clear if the loop is broken somehow. If not, not publishing packages that only have an `Upgrade` in their commit history should be enough. E.g.: If `https-only` gets a `patch`, there will be a commit for `configuration-web-recommended` but nothing should be published so the version will not be bumped.

What should happen when any of these packages gets updated?

If dependency version bumping is done automatically by the release script, everything will be a `patch` (except the package that started the loop that can be anything).

But what if changes are required? **This is something we need to decide**
Let's use `configuration` as an example. If `configuration` gets a `major` bump. There could be several reasons depending on how we interpret `public API` changes in `semver`:

* A `hint` changes the message reports (`Breaking`). In principle the public API of `config` does not change because it only exposes a `json`, but one could argue that the output has indeed changed. If we align with this, `configuration` should get a major version as well. What happens then to `hint` that depends on `configuration`? Should it get a major bump as well? Because the public API doesn't change, `configuration` is an optional dependency, and it is only used from the CLI, it should be a `patch`. _Right it is not clear what the release script does. Does it assume it is a breaking change in the config? The easiest solution will be to use a `patch`_
* `configuration` needs to change the `json` format. This means `hint`'s configuration schema has changed as well with another breaking change. It is very unlikely this will work with the current release script knowing that packages are bumped individually and not holistically. `hint` will be the first package to be published and it will point to an old version of `configuration` that is not compatible. Something similar has happened with `hint@4.4.1` that points to `configuration-web-recommended@5.0.0` but the latest version is `6.0.0` (although in this case the configurations are compatible).

## Proposed solution

Taking into account the current problems, the biggest proposed change is to update and test everything holistically. We are using yarn and workspaces to make it easier to handle updates accross different packages but yet we are upgrading and releasing them one by one.

The issues aboved could be solved as this:

* 🏷 **Unreliable tags**: To calculate what commits to use for each package instead of using tags we could find the commit where the `version` in the `package.json` was changed using ` git blame`.

* 🐌 **Slow install process**: Instead of using `npm` we will be using yarn and the versions in the current workspace. To make sure there aren't any issues and that the versions in the workspace are used an script that validates that the latest local packages versions are used (`scripts/fix-dependencies.js`).

* 🌀 **Circular references**: Because the new versions for all packages are calculated simultaneously and not after releasing each package there shouldn't be any issue with this anymore.

* 🛑 **Released stopped because of failing tests**: All the packages will be tested before publishing, if one fails there will be an option to continue regardless.

* 📦 **Missing dependencies**: There are tools such as `eslint-plugin-import` (which is already a dependency but no rules are enabled in `.eslintrc.json` 🤯) in combination with `@typescript-eslint/parser`, and/or `eslint-import-resolver-workspaces`. _Need to test if packages are found correctly or still hoisted versions are found. If hoisted versions are found maybe look into contributing back._

* 🚨 **Easily avoid publishing new packages**: The `private` property in `package.json` should be honored and in order to release a new package it will have to be manually removed.

* 🐛 **Easier testing and bug hunting**: Add new options to the release script to make the testing easier:
  * `--all` will bump to a patch all the versions of all packages and force a release. This way we don't have to rely on random changes in specific packages to trigger an update in all packages.
  * `--preview` will not publish anything into GitHub or npm and will revert the changes to the initial state after ending.

* 🤖 **Release automation**: The script should be smart enought to find the required auth tokens for the different platforms and adapt (if they are available use them, ask if they are not).

### New release process

The process will be:

1. Clean the workspace
1. Make a list of all the packages that need to be published
1. Calculate the new version for all the packages

   If there's only `Upgrade:` commit(s) the package should be tested but not published
1. Print the updates on the screen and ask for confirmation. E.g.:
   ```
   @hint/utils-create-server: 2.2.3 → 2.3.0
   @hint/utils-tests-helpers: 2.0.1 → 2.0.2
   ...
   Does this seem ok? (Y/n)
   ```
1. Update all the `package.json`s
1. Update `CHANGELOG.md`s
1. Ask for `CHANGELOG.md`s confirmation
1. Test the new packages
1. Publish packages
1. Clean up workspace if needed

Same as the current process description, this does not take into account failures, retries, etc.

<!-- link labels -->
[hint]: https://github.com/webhintio/hint
[yarn]: https://yarnpkg.com
[yarn-workspaces]: https://yarnpkg.com/lang/en/docs/workspaces/
