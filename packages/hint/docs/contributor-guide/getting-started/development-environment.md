# Development environment

This is a step-by-step guide to setting up a local development
environment that will let you contribute back to the project.

1. [Install Node.js and yarn](#step-1-install-nodejs-and-yarn)
2. [Fork and checkout your own webhint repository](#step-2-fork-and-checkout-your-own-webhint-repository)
3. [Add the upstream source](#step-3-add-the-upstream-source)
4. [Run the build](#step-4-run-the-build)

## Step 1: Install Node.js and yarn

Go to [`nodejs.org`][nodejs] to download and install the latest stable
version of `Node.js` for your operating system.

Go to [`yarnpkg.com`][yarnpkg] to download and install the latest stable
version of `yarn` for your operating system. `webhint` uses [`yarn`’s
`workspaces`][yarn workspaces] feature to maintain several packages in
the same GitHub repo.

## Step 2: Fork and checkout your own webhint repository

Go to <https://github.com/webhintio/hint> and click the `Fork` button.
Follow the [GitHub documentation][github fork docs] for forking.

Clone your forked repository:

```bash
git clone https://github.com/<your_GitHub_username>/hint.git
```

Then go into the project’s directory:

```bash
cd hint
```

and run `yarn` to get all the necessary dependencies:

```bash
yarn
```

You must be connected to the Internet for this step to work. You’ll
see a lot of utilities being downloaded.

## Step 3: Add the upstream source

The *upstream source* is the main `webhint` repository that active
development happens on. While you won’t have push access to upstream,
you will have pull access, allowing you to pull in the latest code
whenever you want.

To add the upstream source for `webhint`, run the following in your
repository:

For *HTTPS* (recommended) use:

```bash
git remote add upstream https://github.com/webhintio/hint.git
```

Or for *SSH* use:

```bash
git remote add upstream git@github.com:webhintio/hint.git
```

Now, the remote `upstream` points to the upstream source.

## Step 4: Run the build

Run your initial build from `main` before making changes. This
reduces the time for your first build by downloading pre-built assets
instead of building them.

```bash
yarn build
```

In order to keep build and test times fast, run subsequent builds and
tests only for the individual packages you make changes to. Change to
the package directory (`cd packages/{edited-package}`) and run
`yarn build` or `yarn test` from there.

## Built-in scripts

There are different scripts in all the `package.json` (root and package
ones). The following is the list of all the available ones:

<!-- markdownlint-disable MD013 -->

| Command | Description | Availability |
| --------| ----------- | ------------ |
| `ava`   | Shortcut to the `ava` binary. Useful if you want to test one file and/or skip some of the steps of the `test` task | everywhere |
| `build` | This will build the current package or all the packages from scratch | everywhere |
| `build:hint` | This builds the main `webhint` package | root |
| `build:assets` | Copies the static files to the `dist` folder | package |
| `build:ts` | Compiles the TypeScript files and outputs to the `dist` folder | package |
| `clean` | Cleans the output of all the packages or the current one  | everywhere |
| `lint` | Lints all the markdown and TypeScript files | everywhere |
| `lint:js` | Lints TypeScript files using `eslint`  | everywhere |
| `lint:md` | Lints markdown files using `markdownlint` | everywhere |
| `new:hint`| Starts the wizard to create a new hint under `/packages/` | root |
| `release` | Publishes the package in `npm` after running the tests and validate everything is fine | package |
| `webhint` | Runs `webhint` from `packages/hint` | package (hint) |
| `test` | Builds the package or the most recent modified packages and runs the tests with code coverage | everywhere |
| `test-all` | Builds the whole project and run the tests of all the packages | root |
| `watch` | Launches all the other `watch` tasks in parallel, useful when developing | package |
| `watch:resources` | Copies all the static assets to `dist` and any new ones added | package |
| `watch:test` | Runs the tests as soon as there is a test in the tests or in the code to test | package |
| `watch:ts` | Compiles the TypeScript files as soon as there is a change | package |

<!-- markdownlint-enable MD013 -->

<!-- Link labels: -->

[github fork docs]: https://help.github.com/articles/fork-a-repo
[nodejs]: https://nodejs.org/en/download/current/
[npm]: https://www.npmjs.com/get-npm
[yarnpkg]: https://yarnpkg.com
[yarn workspaces]: https://yarnpkg.com/en/docs/workspaces
