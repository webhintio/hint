# Using the API

`webhint` expose an API allowing the users run webhint inside their code,
without using the CLI.

With this API, the users have more control in what to analyze, when, and
what to do with the results.

## How to use the API

To use the API, the first thing you need to do is import the class `Analyzer`.

```js
import { Analyzer } from 'hint';
```

This example is using TypeScript, so you will also need to import some type
definitions to enable Intellisense support and a successful build.
Any type should be available directly in the `hint` package.
For this case we need `UserConfig` and `AnalyzerResult`:

 ```ts
import { UserConfig, AnalyzerResult } from 'hint';
```

Once you have the class `Analyzer`, you need to create an instance of
the class.

To do so, you need to use the static method `create`.

```ts
const userConfig: UserConfig;
const options: CreateAnalyzerOptions
const webhint = Analyzer.create(userConfig, options);
```

`Analyzer.create` will validate the configuration, load all the resources
needed, initialize the formatters and return an `Analyzer` instance.

Now, you can analyze any url you need using `webhint.analyze`.

```ts
const userConfig: UserConfig;
const options: CreateAnalyzerOptions
const webhint = Analyzer.create(userConfig, options);

const analysisOptions: AnalyzerOptions;
const results: AnalyzerResult[] = await webhint.analyze('http://example.com', options);
```

`webhint.analyze` receive as a first parameter an `Endpoint`.

```ts
export type Target = {
    url: string | URL;
    content?: string;
};
export type Endpoint = string | URL | Target;
```

Because `webhint.analyze` can analyze multiple URLs, the result
is `AnalyzeResult[]` and not only `Problem[]` or `Problem`, so the users can
know easily for what URL the results are for.

```ts
export type AnalyzerResult = {
    url: string;
    problems: Problem[];
};
```

After the analysis, if the users want to use the formatter configured to
show the problems, the users can use `webhint.format`.

```ts
const options: FormatterOptions;
await webhint.format(results[0].problems, options);
```

Or they can control what to do the problems detected (e.g. ignore hint axe problems).

```ts
results.forEach((result) => {
    result.problems.forEach((problem) => {
        // Print everything except axe hint problems.
        if(problem.hintId !== 'axe') {
            console.log(`${problem.hintId} - ${problem.resource} - ${problem.message}`);
        }
    });
});
```

## Examples

Analyze website and print the results manually instead of using 'format'.

```ts
import { Analyzer } from 'hint';

const userConfig = {
    extends: ['web-recommended'],
    formatters: []
};

const webhint = Analyzer.create(userConfig);

const results: AnalyzerResult[] = await webhint.analyze('http://example.com');

results.forEach((result) => {
    console.log(`Result for: ${result.url}`);

    result.problems.forEach((problem) => {
        console.log(`${problem.hintId} - ${problem.resource} - ${problem.message}`);
    });
});
```

Analyze website and print the results using the formatters in the configuration.

```ts
import { Analyzer } from 'hint';

const userConfig = {
    extends: ['web-recommended']
};

const webhint = Analyzer.create(userConfig);

const results: AnalyzerResult[] = await webhint.analyze('http://example.com');

results.forEach((result) => {
    console.log(`Result for: ${result.url}`);

    // Print the result using `formatter-html` and `formatter-summary`
    webhint.format(result.problems);
});
```
