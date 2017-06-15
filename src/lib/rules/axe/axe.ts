/**
 * @fileoverview Runs [axe-core](https://www.npmjs.com/package/axe-core) in the context
 * of the page and checks if there are any issues with a11y.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as path from 'path';

import { readFile } from '../../utils/misc';
import { debug as d } from '../../utils/debug';
import { ITraverseEnd, IRule, IRuleBuilder, Severity } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let axeConfig = {};

        const loadRuleConfig = () => {
            if (!context.ruleOptions) {
                return;
            }

            axeConfig = context.ruleOptions;
        };

        const generateScript = () => {
            // This is run in the page, not Sonar itself.
            // axe.run returns a promise which fulfills with a results object
            // containing any violations.
            const script =
                `function runA11yChecks() {
    return window['axe'].run(document, ${JSON.stringify(axeConfig, null, 2)});
}`;

            return script;
        };

        const getElement = async (node) => {
            const selector = node.target[0];
            const elements = await context.querySelectorAll(selector);

            return elements[0];
        };

        const validate = async (traverseEnd: ITraverseEnd) => {
            const { resource } = traverseEnd;
            const axeCore = await readFile(path.join(process.cwd(), 'node_modules', 'axe-core', 'axe.js'));
            const script = `(function () {
    ${axeCore};
    return (${generateScript()}());
}())`;

            let result = null;

            /* istanbul ignore next */
            try {
                result = await context.evaluate(script);
            } catch (e) {
                await context.report(resource, null, `Error executing script: "${e.message}". Please try with another collector`, null, null, Severity.warning);
                debug('Error executing script %O', e);

                return;
            }

            /* istanbul ignore next */
            if (!result || !Array.isArray(result.violations)) {
                debug(`Unable to parse axe results ${result}`);

                return;
            }

            if (result.violations.length === 0) {
                debug('No accessibility issues found');

                return;
            }

            const reportPromises = result.violations.reduce((promises, violation) => {

                const elementPromises = violation.nodes.map(async (node) => {
                    const element = await getElement(node);

                    //TODO: find the right element here using node.target[0] ?
                    await context.report(resource, element, violation.help);

                    return;
                });

                return promises.concat(elementPromises);
            }, []);

            await Promise.all(reportPromises);
        };

        loadRuleConfig();

        return { 'traverse::end': validate };
    },
    meta: {
        docs: {
            category: 'accessibility',
            description: 'Runs axe-core tests in the target'
        },
        fixable: 'code',
        recommended: true,
        schema: [{
            additionalProperties: false,
            properties: {
                rules: {
                    patternProperties: {
                        '^.+$': {
                            additionalProperties: false,
                            properties: { enabled: { type: 'boolean' } },
                            required: ['enabled'],
                            type: 'object'
                        }
                    },
                    type: 'object'
                },
                runOnly: {
                    additionalProperties: false,
                    properties: {
                        type: { type: 'string' },
                        values: {
                            items: { type: 'string' },
                            minItems: 1,
                            type: 'array',
                            uniqueItems: true
                        }
                    },
                    type: 'object'
                }
            }
        }],
        worksWithLocalFiles: true
    }
};

module.exports = rule;
