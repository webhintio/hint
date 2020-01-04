<!-- markdownlint-disable MD024 -->
# Using CircleCI and webhint

[CircleCI][] is a CI/CD service you can use to run webhint
to test your website.

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

Add the file `.circleci/config.yml` to your project:

```yml
version: 2.1
jobs:
  build:
    docker:
      - image: circleci/node:lts
    steps:
      - checkout # check out the code in the project directory
      - run: npm install
      - run: npm run test-hint
```

**Note:** By default, `hint` will use
`configuration-development` if a `.hintrc` file is not present.

### For other project types

If your project is not a Node project or you don't want to
modify your `package.json` file, you can add a `.circleci/config.yml` to your project:

```yml
version: 2.1
jobs:
  build:
    docker:
      - image: circleci/python:latest-node
    steps:
      - checkout # check out the code in the project directory
      - run: npm install hint --no-save
      - run: node node_modules/hint/dist/src/bin/hint.js ./ # ./ or the path where the files to test are.
```

In this case, we need `nodejs` to be included in the Docker image. For the pre-built
CircleCI images, you just need to add `-node` to the image tag. If you are
using your own image, you need to update it to include `nodejs`. Once we have
Node in the image, we can install `hint` manually and run the scan.

As in the previous example, the default configuration will be `configuration-development`.

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

Add the file `.circleci/config.yml` to your project:

```yml
version: 2.1
jobs:
  build:
    docker:
      - image: circleci/node:lts-browsers
    steps:
      - checkout # check out the code in the project directory
      # Add the necessary steps to deploy your website.
      - run: npm install
      - run: npm run test
```

**Note:** By default, `hint` will use
`configuration-web-recommended` if a `.hintrc` file is not present.

**Note:** By default, `configuration-web-recommended` uses the
`puppeteer` connector, which requires a Chromium browser to work. If you are using
a pre-built CircleCI image, you just need to add `-browsers` to the tag
to have browsers installed. If you are using your own custom image, you need
to install a Chromium browser in your image first.

### For other project types

If your project is not a Node project or you don't want to
modify your `package.json`, you can

add `.circleci/config.yml` to your project:

```yml
version: 2.1
jobs:
  build:
    docker:
      - image: circleci/python:latest-node-browsers
    steps:
      - checkout # check out the code in the project directory
      # Add the necessary steps to deploy your website.
      - run: npm install hint --no-save
      - run: node node_modules/hint/dist/src/bin/hint.js https://url-to-your-project
```

The default configuration will be `configuration-web-recommended`.

In this case, we need `nodejs` and browsers to be included in the Docker image.
For the pre-built CircleCI images, you need to add `-node-browsers` to the
image tag. If you are using a custom image, you will need to install `nodejs`
and a Chromium browser in your image.

## Common

### Enabling telemetry

**Note:** To know more about how webhint uses telemetry, please visit
the [telemetry documentation][].

You can enable telemetry by adding either a parameter or an `env` variable.

1. By parameter: Add `--telemetry=on` to the script in your `package.json`

    ```json
    …
    "scripts": {
        …
        "test-hint": "hint https://webhint.io --debug --telemetry=on"
      },
    …
    ```

    or in your `.circleci/config.yml`:

    ```yml
    version: 2.1
    jobs:
      build:
        docker:
          - image: circleci/python:latest-node-browsers
        steps:
          - checkout # check out the code in the project directory
          # Add the necessary steps to deploy your website.
          - run: npm install hint --no-save
          - run: node node_modules/hint/dist/src/bin/hint.js https://url-to-your-project --telemetry=on
    ```

2. By `env` variable: You need to configure the `env` variable `HINT_TELEMETRY` in
   `.circleci/config.yml`:

    ```yml
    version: 2.1
    jobs:
      build:
        docker:
          - image: circleci/node:lts-browsers
        steps:
          - checkout # check out the code in the project directory
          - run: echo 'export HINT_TELEMETRY="on"' >> $BASH_ENV
          - run: npm install
          - run: npm run test-hint
    ```

## Further configuration

In order to change the output, severity of the hints, etc. you will have to
use your own `.hintrc` file. Please check the [configuring webhint] section
for more details.

<!-- Link labels -->

[CircleCI]: https://circleci.com/
[configuring webhint]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[telemetry documentation]: https://webhint.io/docs/user-guide/telemetry/summary/
