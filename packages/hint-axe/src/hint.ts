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

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { IAsyncHTMLElement, IHint, Severity, CanEvaluateScript } from 'hint/dist/src/lib/types';
import readFileAsync from 'hint/dist/src/lib/utils/fs/read-file-async';
import { HintContext } from 'hint/dist/src/lib/hint-context';

import meta from './meta';

const debug = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class AxeHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext) {

        let axeConfig: object = { runOnly: ['wcag2a', 'wcag2aa'] };

        const loadHintConfig = () => {
            if (!context.hintOptions) {
                return;
            }

            axeConfig = context.hintOptions;
        };

        const generateScript = (): string => {
            /*
             * This is run in the page, not hint itself.
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
            const elements: IAsyncHTMLElement[] = await context.querySelectorAll(selector);

            return elements[0];
        };

        const validate = async (canEvaluateScript: CanEvaluateScript) => {
            const { resource } = canEvaluateScript;
            const axeCore: string = await readFileAsync(require.resolve('axe-core'));
            const script: string = `(function () {
    ${axeCore};
    return (${generateScript()}());
}())`;

            let result: AxeResults | null = null;

            /* istanbul ignore next */
            try {
                result = await context.evaluate(script);
            } catch (e) {
                let message: string;

                if (e.message.includes('evaluation exceeded')) {
                    message = `webhint did not return the result fast enough`;
                } else {
                    message = `Error executing script: '${e.message}'`;
                }

                message = `${message}. Please try again later, or report an issue if this problem persists.`;

                await context.report(resource, message, { severity: Severity.warning });
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

            const reportPromises: Promise<void>[] = result.violations.reduce((promises: Promise<void>[], violation: AxeResult) => {

                const elementPromises = violation.nodes.map(async (node: AxeNodeResult) => {
                    const element = await getElement(node);

                    // TODO: find the right element here using node.target[0] ?
                    await context.report(resource, violation.help, { element });

                    return;
                });

                return promises.concat(elementPromises);
            }, []);

            await Promise.all(reportPromises);
        };

        loadHintConfig();

        context.on('can-evaluate::script', validate);
    }
}
