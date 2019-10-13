<!-- markdownlint-disable MD024 -->
# Using CircleCI and webhint

[CircleCI][] is a CI/CD service you can use to run webhint
to test your website.

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

**Note:** In this case `hint` will use as default configuration
`configuration-development` if a `.hintrc` file is not present.

### Project in another language or not included in package.json

When your project is not a `nodejs` project or you just doesn't want to/can
modify your `package.json` you can do:

Add a `.circleci/config.yml` to your project:

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

In this case, we need `nodejs` to be install in the image. For the built-in
images in circleci, you just need to add `-node` to the image tag, if you are
using your own image, you need to update it to include `nodejs`. Once we have
node in the image, we can install `hint` manually and run the scan.

As in the previous example, the default configuration will be `configuration-development`.

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

**Note:** In this case `hint` will use as default configuration
`configuration-web-recommended` if a `.hintrc` file is not present.

**Note:** `configuration-web-recommended` use by default the connector
`puppeteer` which requires a "chromium" browser to work. In you are using
a `circleci` built-in image, you just need to add `-browsers` to the tag
to have browsers installed. If you are using you custom image, you need
to install a chromium browser in your image first.

### Project in another language or hint not included in the package.json

When your project is not a `nodejs` project or you just doesn't want to/can
modify your `package.json` you can do:

Add the file `.circleci/config.yml` to your project:

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

The default configuration in this case will be `configuration-web-recommended`

As you can notice, if you need `nodejs` + browsers in your circleci image, you
need to add `-node-browsers` to the image tag. If you are using a custom image,
you will need to install node and a chromium browser in you image.

## Common

### Enabling telemetry

To enabling telemetry you have a couple of options:

1. By parameter. You need to add the parameter to the script to your `package.json`

    ```json
    …
    "scripts": {
        …
        "test-hint": "hint https://webhint.io --debug --tracking=on"
      },
    …
    ```

    or in you `.circleci/config.yml`:

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
          - run: node node_modules/hint/dist/src/bin/hint.js https://url-to-your-project --tracking=on
    ```

1. By env variable. You need to configure the env variable `HINT_TRACKING` in
   your file `.circleci/config.yml`:

    ```yml
    version: 2.1
    jobs:
      build:
        docker:
          - image: circleci/node:lts-browsers
        steps:
          - checkout # check out the code in the project directory
          - run: echo 'export HINT_TRACKING="on"' >> $BASH_ENV
          - run: npm install
          - run: npm run test-hint
    ```

## Further configuration

In order to change the output, severity of the hints, etc. you will have to
use your own `.hintrc` file. Please check the section [configurating webhint]
for more details.

<!-- Link labels -->

[CircleCI]: https://circleci.com/
[configuring webhint]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
