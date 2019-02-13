# Release process automation and improvements

**STATUS: WORK IN PROGRESS**

## Background

The repo [hint][hint] is a monorepo. This means it contains several packages under the same source control so it is easier to update them. In this case all those packages are under the `packages` folder: main CLI, `hint`s, `connector`s, `formatter`s, `configuration`s, etc. Everything maintained by the team lives there.

The piece that makes this possible is [`yarn`][yarn] and its [`workspaces`][yarn-workspaces].

**REWORK THIS PART**
The team deeply believes in automation, and the release process is part of this: Bumping
to new versions, update local dependencies, publishing to npm... Everything is automated or at least partially. Unfortunatelly, this is not an easy task and there are several things that can cause trouble:

* `yarn` and `npm` do not produce the same output
* Knowing exactly how to bump a version, especially when dealing with dependencies, can be complex
* Commit messages are not always acurate
* There can be circular references (e.g.: `hint` and `configuration-web-developement`)

This text aims to document what the release process should be under any circumstance.
**END REWORK**

## Current process

The current release process is done via `npm run release` that executes `scripts/release.ts` and the gist is:

1. Calculate what packages need to be published. To do this searches the latest tag for each package and checks if there have been any commits since then that affect it.
1. Sort the dependencies by less dependants, i.e. if `packageA` depends on `packageB` it will work on `packageB` first.
1. For each package:
   * Bump the `version` in the `package.json` of the package usint the related commit message(s) and update `CHANGELOG.md`
   * Clean the package, intall dependencies via `npm`, and run `npm run test-release`
   * Publish the new package to npm
   * Update references from other packages
   * Publish changes into GitHub

### Current problems

There are a few problems with the current approach:

* Using `tag`s to calculate the list of changes is not reliable. The team has experienced issues with tags being different accross forks, and such.
* Installing each package individually is a slow process. There used to be problems with dependencies missing and such that can probably be avoided with the right tooling.

  In the past we had problems because when using workspaces all the dependencies are hoisted so if a dependency was declared in another `package.json`, it will still be found in other packages.
* Another issue using npm to install the dependencies of each package individually is that the packages need to be published in the right order and npm needs to be updated so there isn't any problem requesting the dependency. There have been instances where npm's index wasn't yet updated and the process crashed because the wanted version wasn't available.
* Circular references, this is part of the above
* Because each package is tested individually when doing the release (contrary to testing everything first before releasing) the release process might stop in the middle because one of the packages fails for whatever reason.
* Can't bypass tests, auto approve commit messages, release an specific package, etc.

## Proposed changes

Taking into account the current problems, the biggest proposed change is to update and test everything holistically. We are using yarn and workspaces to make it easier to handle updates accross different packages but yet we are upgrading and releasing them one by one.

The issues aboved could be solved as this:

* **Unreliable tags**: To calculate what commits to use for each package instead of using tags we could find the commit where the `version` in the `package.json` was changed using ` git blame`.

* **Slow install process**: Instead of using `npm` we will be using yarn and the versions in the current workspace. To make sure there aren't any issues and that the versions in the workspace are used an script that validates that the latest local packages versions are used (`scripts/fix-dependencies.js`).

* **Circular references**: Because all the packages are updated simultaneously there shouldn't be any issue with this anymore.

* **Released stopped because of failing tests**: All the packages will be tested before publishing anything with the option to continue if we want to by-pass the results.

* **Missing dependencies on package**: There are tools such as `eslint-plugin-import` (which is already a dependency but no rules are enabled 🤯) in combination with `@typescript-eslint/parser`, and/or `eslint-import-resolver-workspaces`. _Need to test if packages are found correctly or still hoisted versions are found. If hoisted versions are found maybe look into contributing back._


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

## Bump version strategy on commits

Commit messages are used to know how to bump the version of a package:

* `Docs:` no version change, related to `.md` changes
* `Build:` no version change, related to build and release scripts
* `Chore:` refactoring, tests, etc. anything not user-facing will be a `patch` (x.x.X)
* `Upgrade:` dependency updates with no public API changes are a `patch` (x.x.X)
* `Fix:` bug fixes are a `patch` (x.x.X)
* `New:` added functionality that does not break previous behavior is a `minor` (x.X.x)
* `Breaking:` any change to the public API or output (like error messages) is a `major` (X.x.x)

## Bump strategy when updating local dependencies automatically

The release process updates local dependencies directly. When this happens the general rule of thumb is that the version update should be a `patch`, same as when an external dependency gets updated.

## What happens if the new local version is a breaking change?

TL;DR; it depends and in this circumstances the commit messages need to be the correct ones to not mess anything.

If there are no changes to the public API or output it should be a `patch`, even if there are some internal changes that need to be done. Let's see an example:

`utils-create-server` switches their API to spawn a new process per server and makes all its API `async`. This is a breaking change so it should be noted as `Breaking: Make API async`. The release script will bump it to the next major version, so if previously it was `3.2.1`, it will be update to `4.0.0`. At the same time we do this breaking change we want to update the packages that depend on it:

| Dependency |
|------------|
| @hint/connector-chrome |
| @hint/connector-jsdom |
| @hint/extension-browser |
| @hint/utils-connector-tools |
| @hint/utils-tests-helpers |

The interaction in each package with `utils-create-server` needs to be updated, but nothing changes externally so the commit to make those changes should be something like `Chore: Update to new utils-create-server interface`. Let's pick `utils-tests-helpers` and assume the current version is `2.0.1` and its `package.json` could look like:

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

This is fine because of the way `semVer` works. Version `2.0.1` and prior will download the latest `3.2.x` version of `@utils/create-test-server`. Version `2.0.2` and later will download `4.0.x`.

Let's follow this example. Now that `@hint/utils-test-server` has been updated, what happens to all the other packages that depend on it (almost all hints)? The packages will have a dependency such as:

```json
"@hint/utils-test-server": "^2.0.1"
```
When doing a clean install the version `2.0.2` will be downloaded among the latest `@hint/utils-create-server"`

Should the release script update the local dependencies automatically? Yes, but publishing a new version shouldn't be needed if that is the only change.

## What about circular references?

webhint has a relatively weird circular reference via `devDependencies`, `peerDependencies`, and `optionalDependencies`. The circle is:

`configuration-web-recommended` → `https-only` as `dependency` (could be any other hint) → `hint` as `peerDependency` and `devDependency` → `configuration-web-recommended`  as `optionalDependency`

What should happen when any of these packages gets updated?

If all the udpates are done automatically via the release script the most common output will be `patch`es. The reason is that [no code changes are needed to upgrade thus a `patch`](https://semver.org/#what-should-i-do-if-i-update-my-own-dependencies-without-changing-the-public-api).

To break the loop, no packages should be published if there's only local `Upgrade:` commits. E.g.: If `https-only` gets a `patch`, there will be a commit for `configuration-web-recommended` but nothing should be published.

* `configuration`: Any change should transform into a `patch` in `hint`. If `configuration` has a `major` release this will mean the schema has changed and thus those changes come directly from `hint`
* `https-only`: A `patch` should transform into another `patch` in `configuration` that will be another `patch` in `hint`
* `hint`: A `patch` should transform into another `patch` in `https-only` that will be another `patch` in `hint`


|                 | `configuration` | `https-only` |   `hint`  |
|-----------------|-----------------|--------------|-----------|
| `configuration` |       N/A       |     N/A      | `patch`   |
| `https-only`    |    `patch`      |     N/A      | `patch`   |
| `hint`          |    `patch`      |  `patch`     |    N/A    |

The exception is with `Breaking:`:

* `hint`:
  * `https-only` code doesn't need to be updated → `patch` for `https-only` and `configuration`
  * `https-only` code needs to be updated but no public API changes → `patch


|                 | `https-only` | `configuration` |
|-----------------|--------------|-----------------|
|  No code needed |   `patch`    |    `patch`      |
|  No API change  |   `patch`    |    `patch`      |
|  API change     |   `major`    |    `patch`      |




### `minor`

A `minor` upgrade works similar to a `patch` one:

* `configuration`: A `minor` should transform into a `patch` because it doesn't change the public API. It could change the results but for simplicity we decided to stick with `patch`
* `https-only`: A `minor` should transform into a `patch` in `configuration` and another `patch` in `hint`
* `hint`: A `minor` should transform into `patch` in `https-only` because it should be backwards compatible and then another `patch` in `configuration`

Again, no packages should be published if there's only local `Upgrade:` commits

|                 | `configuration` | `https-only` |   `hint`  |
|-----------------| ----------------|--------------|-----------|
| `configuration` |       N/A       |     N/A      |  `patch`  |
| `https-only`    |     `patch`     |     N/A      |  `patch`  |
| `hint`          |     `patch`     |   `patch`    |    N/A    |

### `major`

* `configuration`:
* `https-only`:
* `hint`:

|                 | `configuration` | `https-only` |   `hint`  |
|-----------------| ----------------|--------------|-----------|
| `configuration` |       N/A       |     N/A      |  `patch`  |
| `https-only`    |     `patch`     |     N/A      |    N/A    |
| `hint`          |       N/A       |   `patch`    |    N/A    |


* `https-only` has a breaking change and changes the output of the message. What should be `configuration-web-recommended`'s new version? `configuration-web-recommended` is used to download and export a `json` object so the public API hasn't changed so it should be bumped with a `patch`.






<!-- link labels -->
[hint]: https://github.com/webhintio/hint
[yarn]: https://yarnpkg.com
[yarn-workspaces]: https://yarnpkg.com/lang/en/docs/workspaces/