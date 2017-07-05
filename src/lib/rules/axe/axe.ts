/**
 * @fileoverview Runs axe-core (https://www.npmjs.com/package/axe-core)
 * in the context of the page and checks if there are any issues with a11y.
 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import { AxeResults, Result as AxeResult, NodeResult as AxeNodeResult } from 'axe-core'; // eslint-disable-line no-unused-vars

import { readFileAsync } from '../../utils/misc';
import { debug as d } from '../../utils/debug';
import { IAsyncHTMLElement, ITraverseEnd, IRule, IRuleBuilder, Severity } from '../../types'; // eslint-disable-line no-unused-vars
import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

const debug = d(__filename);

// ------------------------------------------------------------------------------
// Public
// ------------------------------------------------------------------------------

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {

        let axeConfig: object = {};

        const loadRuleConfig = () => {
            if (!context.ruleOptions) {
                return;
            }

            axeConfig = context.ruleOptions;
        };

        const generateScript = (): string => {
            // This is run in the page, not Sonar itself.
            // axe.run returns a promise which fulfills with a results object
            // containing any violations.
            const script: string =
                `function runA11yChecks() {
    return window['axe'].run(document, ${JSON.stringify(axeConfig, null, 2)});
}`;

            return script;
        };

        const getElement = async (node: AxeNodeResult): Promise<IAsyncHTMLElement> => {
            const selector: string = node.target[0];
            const elements: Array<IAsyncHTMLElement> = await context.querySelectorAll(selector);

            return elements[0];
        };

        const validate = async (traverseEnd: ITraverseEnd) => {
            const { resource } = traverseEnd;
            const axeCore: string = await readFileAsync(require.resolve('axe-core'));
            const script: string = `(function () {
    ${axeCore};
    return (${generateScript()}());
}())`;

            let result: AxeResults = null;

            /* istanbul ignore next */
            try {
                result = await context.evaluate(script);
            } catch (e) {
                await context.report(resource, null, `Error executing script: "${e.message}". Please try with another connector`, null, null, Severity.warning);
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

            const reportPromises: Array<Promise<void>> = result.violations.reduce((promises: Array<Promise<void>>, violation: AxeResult) => {

                const elementPromises = violation.nodes.map(async (node: AxeNodeResult) => {
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
