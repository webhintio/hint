/**
 * @fileoverview Inform users that they need to use createElementNS to create SVG elements instead of createElement
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { ScriptEvents, ScriptParse } from '@hint/parser-javascript';

import { Linter } from 'eslint';

import meta from './meta';
import svgElements from './svgElements';

const debug: debug.IDebugger = d(__filename);

export default class CreateElementSvgHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<ScriptEvents>) {
        const linter = new Linter();

        /*
         * Check to see if any call expression in the AST has a callee with
         * a 'createElement' property. If yes, check if that call expression's
         * first argument is an SVG element. In that case, report an error as
         * the correct identifier property for creating SVG elements is
         * 'createElementNS'
         */
        linter.defineRule('svg-create', {
            create(eslintContext) {
                return {
                    CallExpression(node) {
                        if (!('callee' in node && 'property' in node.callee && 'name' in node.callee.property)) {
                            return;
                        }

                        if (node.callee.property.name !== 'createElement') {
                            return;
                        }

                        const arg = node.arguments[0];

                        if (arg && 'value' in arg && typeof arg.value === 'string' && svgElements.has(arg.value.toLowerCase())) {
                            eslintContext.report({
                                loc: node.callee.property.loc,
                                messageId: 'avoidElement',
                                node: node.callee.property
                            });
                        }
                    }
                };
            },
            meta: { messages: { avoidElement: 'SVG elements cannot be created with createElement; use createElementNS instead' } }
        });

        const validateScript = async ({ element, sourceCode, resource }: ScriptParse) => {

            debug(`Validating hint create-element-svg`);

            const results = linter.verify(sourceCode, { rules: { 'svg-create': 'error' } });

            for (const result of results) {
                // ESLint location is 1-based
                const location = {
                    column: result.column - 1,
                    line: result.line - 1
                };

                await context.report(resource, result.message, { element, location });
            }
        };

        context.on('parse::end::javascript', validateScript);
    }
}
