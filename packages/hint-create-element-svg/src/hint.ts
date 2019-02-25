/**
 * @fileoverview Inform users that they need to use createElementNS to create SVG elements instead of createElement
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, IAsyncHTMLElement, ProblemLocation } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { ScriptEvents, ScriptParse } from '@hint/parser-javascript';
import { findProblemLocation } from 'hint/dist/src/lib/utils/location-helpers';

import { Linter } from 'eslint';

import meta from './meta';
import svgElements from './svgElements';

const debug: debug.IDebugger = d(__filename);

export default class CreateElementSvgHint implements IHint {

    public static readonly meta = meta;

    /** Finds the approximative location in the page's HTML for a match in an element. */
    public findProblemLocation(element: IAsyncHTMLElement, content?: string): Promise<ProblemLocation> {
        return findProblemLocation(element, { column: 0, line: 0 }, content);
    }

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
                                messageId: 'avoidElement',
                                node: node.callee.property
                            });
                        }
                    }
                };
            },
            meta: { messages: { avoidElement: 'SVG elements cannot be created with createElement; use createElementNS instead' } }
        });

        const validateScript = async (scriptData: ScriptParse) => {

            debug(`Validating hint create-element-svg`);

            const sourceCode = scriptData.sourceCode;
            const results = linter.verify(sourceCode, { rules: { 'svg-create': 'error' } });

            for (const result of results) {
                const element = scriptData.element;

                if (element === null) {
                    return;
                }

                let position = element.getLocation() || null;
                let line = 0;

                /*
                 * Eslint returns location data starting at <script>
                 * This offsets the line number so that it is relative
                 * to the full source code and not just the <script> tag
                 */
                if (scriptData.resource === 'Internal javascript') {
                    position = await findProblemLocation(element, { column: 0, line: 0 }, result.source === null ? '' : result.source);
                    line = position !== null ? position.line : 0;
                }
                await context.report(scriptData.resource, result.message, { location: { column: result.column, line: line + result.line }});
            }
        };

        context.on('parse::end::javascript', validateScript);
    }
}
