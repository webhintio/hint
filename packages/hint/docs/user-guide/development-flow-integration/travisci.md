<!-- markdownlint-disable MD024 -->
# Using Travis CI and webhint

[Travis CI][travisci] is a CI/CD service you can use to run webhint to test
your website.

## Source code analysis

You can integrate `webhint` by adding it to the `package.json` of a Node
project as shown in the "For Node projects" section below. If you are not
using Node or don't want to modify your project's `package.json`, you can
use the instructions in the "For other project types" section.

### For Node projects

In your project, run:

```bash
npm install hint --save--dev
```

In the file `package.json` add a new script `test-hint`:

```json5
...
"scripts": {
    ...
    "test-hint": "hint ./" // ./ or the path where the files to test are.
  }
...
```

Add a `.travis.yml` file to your project:

```yml
language: node_js
node_js:
- 10.16.2

script:
  - npm install
  - npm run test-hint
```

**Note:** By default, `hint` will use
`configuration-development` if a `.hintrc` file is not present.

### For other project types

If your project is not a Node project or you don't want to
modify your `package.json`, you can

add a `.travis.yml` file to your project:

```yml
language: python

before_install:
- nvm install node

script:
  - npm install hint --no-save
  - node node_modules/hint/dist/src/bin/hint.js ./ # ./ or the path where the files to test are.
```

Travis CI includes `nodejs` and `npm` by default, but it is
recommended to install them manually via the `nvm install node` command to
ensure you are using the latest versions.

As in the previous example, the default configuration will be
`configuration-development`.

## Live site analysis

### For Node projects

In your project, run:

```bash
npm install hint --save--dev
```

In the file `package.json` add a new script `test-hint`:

```json5
...
"scripts": {
    ...
    "test-hint": "hint https://url-to-your-project" // ideally, this url will be to your staging/preproduction environment.
}
...
```

Add a `.travis.yml` file to your project:

```yml
language: node_js
node_js:
- 10.16.2

addons:
  chrome: stable

script:
  - npm install
  - npm run test
```

**Note:** By default, `hint` will use
`configuration-web-recommended` if a `.hintrc` file is not present.

**Note:** By default, `configuration-web-recommended` uses the
`puppeteer` connector, which requires a Chromium browser to work.
We install Chrome in our test environment by adding `chrome` to  `addons`.

### For other project types

If your project is not a Node project or you don't want to
modify your `package.json`, you can add a `.travis.yml` file to your project:

```yml
language: python

addons:
  chrome: stable

before_install:
- nvm install node

script:
   # Add the necessary steps to deploy your website.
  - npm install hint --no-save
  - node node_modules/hint/dist/src/bin/hint.js https://url-to-your-project
```

The default configuration in this case will be `configuration-web-recommended`.

In this case, we are telling to Travis CI to install `chrome` and `nodejs`.

## Common

### Enabling telemetry

**Note:** To know more about how webhint uses telemetry, please visit
the [telemetry documentation][].

You can enable telemetry by adding either a parameter or an `env` variable.

1. By parameter: Add `--telemetry=on` to the script in your `package.json`
   `package.json`

    ```json
    …
    "scripts": {
        …
        "test-hint": "hint https://webhint.io --debug --telemetry=on"
      },
    …
    ```

    or in your `.travis.yml`:

    ```yml
    language: python

    addons:
      chrome: stable

    before_install:
    - nvm install node

    script:
       # Add the necessary steps to deploy your website.
      - npm install hint --no-save
      - node node_modules/hint/dist/src/bin/hint.js https://url-to-your-project --telemetry=on
    ```

2. By `env` variable: You need to configure the `env` variable `HINT_TELEMETRY` in
   `.travis.yml`:

    ```yml
    language: node_js
    node_js:
    - 10.16.2

    addons:
      chrome: stable

    env:
      - HINT_TELEMETRY=on

    script:
      - npm install
      - npm run test-hint
    ```

**Note:** Supported values for `HINT_TELEMETRY` are `on` and `off`.

## Further configuration

In order to change the output, severity of the hints, etc. you will have to
use your own `.hintrc` file. Please check the [configuring webhint] section
for more details.

<!-- Link labels -->

[configuring webhint]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[telemetry documentation]: https://webhint.io/docs/user-guide/telemetry/summary/
[travisci]: https://travis-ci.org/
