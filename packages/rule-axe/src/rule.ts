/**
 * @fileoverview Runs axe-core (https://www.npmjs.com/package/axe-core)
 * in the context of the page and checks if there are any issues with a11y.
 */

/*
 * ------------------------------------------------------------------------------
 * Requirements
 * ------------------------------------------------------------------------------
 */

import { AxeResults, Result as AxeResult, NodeResult as AxeNodeResult } from 'axe-core';

import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { debug as d } from 'sonarwhal/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, IRule, Severity, TraverseEnd, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import readFileAsync from 'sonarwhal/dist/src/lib/utils/fs/read-file-async';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';
import { RuleScope } from 'sonarwhal/dist/src/lib/enums/rulescope';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class AxeRule implements IRule {

    public static readonly meta: RuleMetadata = {
        docs: {
            category: Category.accessibility,
            description: 'Runs axe-core tests in the target'
        },
        id: 'axe',
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
        /*
         * axe can not analize a file itself, it needs a connector.
         * TODO: Change to any once the local connector has jsdom.
         */
        scope: RuleScope.site
    }

    public constructor(context: RuleContext) {

        let axeConfig: object = { runOnly: ['wcag2a', 'wcag2aa'] };

        const loadRuleConfig = () => {
            if (!context.ruleOptions) {
                return;
            }

            axeConfig = context.ruleOptions;
        };

        const generateScript = (): string => {
            /*
             * This is run in the page, not sonarwhal itself.
             * axe.run returns a promise which fulfills with a results object
             * containing any violations.
             */
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

        const validate = async (traverseEnd: TraverseEnd) => {
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

                    // TODO: find the right element here using node.target[0] ?
                    await context.report(resource, element, violation.help);

                    return;
                });

                return promises.concat(elementPromises);
            }, []);

            await Promise.all(reportPromises);
        };

        loadRuleConfig();

        context.on('traverse::end', validate);
    }
}
