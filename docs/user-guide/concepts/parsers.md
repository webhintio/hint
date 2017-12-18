# Parsers

A `parser` is capable of understanding more deeply a resource and expose
that information via events so rules can be built on top of this information.
E.g.: a `JavaScript` parser built on top of `ESLint` so rules for analyzing
`JavaScript` files can be built.

You can specify what `parser`s you want to use via the `.sonarwhalrc`
configuration file:

```json
{
    "parsers": ["parser1", "parser2"]
}
```

## List of official `parser`s

The built-in `parser`s are:

* `javascript`: A `JavaScript` parser built on top of `ESLint` so rules for
  analyzing `JavaScript` files can be built.

## How to use a parser

To use a parse you need to subscribe to the event that the parser dispatch.

### javascript parser

To use the content parsed by the `javascript` parser you just need to
subscribe in your rules to the event `parse::javascript`.

This event will send an `IScriptParse` data which has the the following
information:

* `resource` the resource that has been parsed. In case of an internal
  javascript, `Internal javascript` will be the `resource`.

* `sourceCode` a `eslint` `SourceCode` object.

#### Example

Here is an example rule that use the parser:

```ts
import * as eslint from 'eslint';

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        let validPromise;
        const errorsOnly = context.ruleOptions && context.ruleOptions['errors-only'] || false;
        let html;

        const onParseJavascript = async (scriptParse: IScriptParse) => {
            const results = linter.verify(scriptParse.sourceCode, {
                rules: {
                    semi: 2
                }
            });

            for (const result of results) {
                await context.report(scriptParse.resource, null, result.message);
            }
        };

        return {
            'parse::javascript': onParseJavascript
        };
    },
    meta: {
        docs: {
            category: Category.interoperability,
            description: `Check if your scripts use semicolon`
        },
        recommended: false,
        schema: [],
        worksWithLocalFiles: true
    }
};
```