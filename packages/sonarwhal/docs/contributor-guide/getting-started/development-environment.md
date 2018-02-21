# Development environment

This is a step-by-step guide to setting up a local development
environment that will let you contribute back to the project.

1. [Install Node.js and yarn](#step-1-install-nodejs-and-yarn)
2. [Fork and checkout your own sonarwhal repository](#step-2-fork-and-checkout-your-own-sonarwhal-repository)
3. [Add the upstream source](#step-3-add-the-upstream-source)
4. [Run the tests](#step-4-run-the-tests)

## Step 1: Install Node.js and yarn

Go to [`nodejs.org`][nodejs] to download and install the latest stable
version of `Node.js` for your operating system.

Go to [`yarnpkg.com`][yarnpkg] to download and install the latest stable
version of `yarn` for your operating system. `sonarwhal` uses [`yarn`’s
`workspaces`][yarn workspaces] feature to maintain several packages in
the same GitHub repo.

## Step 2: Fork and checkout your own sonarwhal repository

Go to <https://github.com/sonarwhal/sonarwhal> and click the `Fork` button.
Follow the [GitHub documentation][github fork docs] for forking and cloning.

Once you’ve cloned the repository:

```bash
git clone https://github.com/sonarwhal/sonarwhal.git
```

go into the project’s directory:

```bash
cd sonarwhal
```

and run `yarn` to get all the necessary dependencies:

```bash
yarn
```

You must be connected to the Internet for this step to work. You’ll
see a lot of utilities being downloaded.

## Step 3: Add the upstream source

The *upstream source* is the main `sonarwhal` repository that active
development happens on. While you won’t have push access to upstream,
you will have pull access, allowing you to pull in the latest code
whenever you want.

To add the upstream source for `sonarwhal`, run the following in your
repository:

```bash
git remote add upstream git@github.com:sonarwhal/sonarwhal.git
```

Now, the remote `upstream` points to the upstream source.

## Step 4: Run the tests

Running the tests is the best way to ensure you have correctly set up
your development environment. Make sure you’re in the `sonarwhal`
directory, and then run:

```bash
yarn test
```

The testing takes a a bit to complete. If any tests fail, that
likely means one or more parts of the environment setup didn’t complete
correctly. The upstream tests always pass.

## Built-in scripts

There are different scripts in all the `package.json` (root and package ones).
The following is the list of all the available ones:

| Command | Description | Availability |
| --------| ----------- | ------------ |
| `ava`   | Shortcut to the `ava` binary. Useful if you want to test just one file and/or skip some of the steps of the `test` task | everywhere |
| `build` | This will build the current package or all the packages from scratch | everywhere |
| `build:connector-edge` | This builds the `connector-edge` package that is only possible on Windows. This separation is needed because we test on Travis | root |
| `build:sonarwhal` | This builds the main `sonarwhal` package | root |
| `build:assets` | Copies the static files to the `dist` folder | package |
| `build:ts` | Compiles the TypeScript files and outputs to the `dist` folder | package |
| `clean` | Cleans the output of all the packages or the current one  | everywhere |
| `lint` | Lints all the markdown and TypeScript files | everywhere |
| `lint:js` | Lints TypeScript files using `eslint`  | everywhere |
| `lint:md` | Lints markdown files using `markdownlint` | everywhere |
| `new:rule`| Starts the wizard to create a new rule under `/packages/` | root |
| `release` | Publishes the package in `npm` after running the tests and validate everything is fine | package |
| `sonarwhal` | Runs `sonarwhal` from `packages/sonarwhal` | package (sonarwhal) |
| `test` | Builds the package or all packages and runs the tests with code coverage | everywhere |
| `test-on-travis` | This modifies some of the configurations to make sure we don’t run into issues when testing on Travis | everywhere |
| `watch` | Launches all the other `watch` tasks in parallel, useful when developing | package |
| `watch:resources` | Copies all the static assets to `dist` and any new ones added | package |
| `watch:test` | Runs the tests as soon as there is a test in the tests or in the code to test | package |
| `watch:ts` | Compiles the TypeScript files as soon as there is a change | package |

<!-- Link labels: -->

[github fork docs]: https://help.github.com/articles/fork-a-repo
[nodejs]: https://nodejs.org/en/download/current/
[npm]: https://www.npmjs.com/get-npm
[yarnpkg]: https://yarnpkg.com
[yarn workspaces]: https://yarnpkg.com/en/docs/workspaces
