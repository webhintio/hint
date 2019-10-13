<!-- markdownlint-disable MD024 -->
# Using Travis CI and webhint

[Travis CI][travisci] is a CI/CD service you can use to run webhint to test
your website.

## Locally

### Webhint is in the package.json

Run in your project.

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

**Note:** In this case `hint` will use as default configuration
`configuration-development` if a `.hintrc` file is not present.

### Project in another language or not included in the package.json

When your project is not a `nodejs` project or you just doesn't want to/can
modify your `package.json` you can do:

Add a `.travis.yml` to your project:

```yml
language: python

before_install:
- nvm install node

script:
  - npm install hint --no-save
  - node node_modules/hint/dist/src/bin/hint.js ./ # ./ or the path where the files to test are.
```

Travis CI includes node and npm by default but it could be outdated so it is
recommended to install it manually via the `nvm install node` command in
`.travis.yml`.

As in the previous example, the default configuration will be
`configuration-development`.

## Online

### Webhint is in the package.json

Run in your project.

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

Add the file `.travis.yml` to your project:

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

**Note:** In this case `hint` will use as default configuration
`configuration-web-recommended` if a `.hintrc` file is not present.

**Note:** `configuration-web-recommended` use by default the connector
`puppeteer` which requires a "chromium" browser to work. As you can notice,
we are indicating to Travis CI to install `chrome` in our test environment.

### Project in another language or hint not included in the package.json

When your project is not a `nodejs` project or you just do not want/can
modify your `package.json` you can add the file `.travis.yml` to your project:

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

### Configuring telemetry

To configure the telemetry (`on` or `off`) you have a couple options:

1. By parameter. You need to add the parameter to the script to your
   `package.json`

    ```json
    …
    "scripts": {
        …
        "test-hint": "hint https://webhint.io --debug --tracking=on|off"
      },
    …
    ```

    or in you `.travis.yml`:

    ```yml
    language: python

    addons:
      chrome: stable

    before_install:
    - nvm install node

    script:
       # Add the necessary steps to deploy your website.
      - npm install hint --no-save
      - node node_modules/hint/dist/src/bin/hint.js https://url-to-your-project --tracking=on|off
    ```

1. By env variable. You need to configure the env variable `HINT_TRACKING` in
   your file `.travis.yml`:

    ```yml
    language: node_js
    node_js:
    - 10.16.2

    addons:
      chrome: stable

    env:
      - HINT_TRACKING=on|off

    script:
      - npm install
      - npm run test-hint
    ```

**Note:** The value should be `on` or `off`, not `on|off`.

## Further configuration

In order to change the output, severity of the hints, etc. you will have to
use your own `.hintrc` file. Please check the section [configurating webhint]
for more details.

<!-- Link labels -->

[configuring webhint]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[travisci]: https://travis-ci.org/
