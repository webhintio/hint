/**
 * Run markdownlint via the API in order to add custom rules for our needs.
 *
 * Custom rules:
 *
 * * `validate-reference-links`: Validates that there are not any typos when
 *   using reference links.
 *
 */
const path = require('path');

const markdownlint = require('markdownlint');
const globby = require('globby');

const files = globby.sync(['**/*.md', '!**/CHANGELOG.md', '!**/node_modules/**'], {
    cwd: process.cwd(),
    gitignore: true
});

const config = markdownlint.readConfigSync(path.join(__dirname, '..', '.markdownlintrc')); // eslint-disable-line no-sync
const result = markdownlint.sync({
    config,
    customRules: [
        {
            description: 'Invalid reference link',
            function: (params, onError) => {
                /**
                 * markdown-lint automatically transforms founded reference links when
                 * passing the tokens and removing the markdown code. E.g.:
                 * * `[something][somewhere]` → Is a child of type `text` with content
                 *   set to `something`
                 *
                 * If the reference is not found it will return the following:
                 * `[something][somewhere]` → Is a child of type `text` with content
                 *   set to `[something][somewhere]`
                 *
                 * To know if a reference is found or not, we search all the children
                 * of type `text` and we check if their content matches the RegExp.
                 * If it is we know the reference is invalid.
                 *
                 */

                /**
                 * This matches the ending part of a reference link. E.g:  `][somewhere]`
                 * Taking into account new lines, etc.
                 */
                const refLinkRegExp = /\](\[(.|\s)*?\])/gi;

                params.tokens.filter((token) => token.type === 'inline').forEach((token) => token.children.filter((child) => child.type === 'text').forEach((text) => {
                    const invalidRefLink = refLinkRegExp.exec(text.content);

                    if (invalidRefLink !== null) {
                        onError({
                            // context: invalidRefLink[1],
                            detail: `Reference: ${invalidRefLink[1]}`,
                            lineNumber: text.lineNumber
                        });
                    }
                }));
            },
            names: ['valid-reference-links'],
            tags: ['links']
        }
    ],
    files,
    resultVersion: 1
});

const resultString = result.toString();
const returnCode = resultString ? 1 : 0;

if (resultString) {
    console.error(resultString);
}

process.exit(returnCode); // eslint-disable-line