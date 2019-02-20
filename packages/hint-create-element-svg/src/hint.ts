/**
 * @fileoverview Inform users that they need to use createElementNS to create SVG elements instead of createElement
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ElementFound, IAsyncHTMLElement, ProblemLocation } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { ScriptEvents, ScriptParse } from '@hint/parser-javascript';
import { findProblemLocation } from 'hint/dist/src/lib/utils/location-helpers';

import { Linter } from 'eslint';
import * as ESTree from 'estree';

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
                        const exp = node as ESTree.CallExpression;
                        const args = exp.arguments;
                        const callee = exp.callee as ESTree.MemberExpression;
                        const property = callee !== undefined && callee !== null ? callee.property as ESTree.Identifier : null;

                        if (property !== null && property.name === 'createElement' && args.length >= 1 && args[0].type === 'Literal') {
                            const arg = args[0] as ESTree.Literal;

                            if (arg.value !== undefined && arg.value !== null && svgElements.has(arg.value.toString().toLowerCase())) {
                                eslintContext.report({
                                    messageId: 'avoidElement',
                                    node
                                });
                            }
                        }
                    }
                };
            },
            meta: { messages: { avoidElement: 'Avoid using createElement to create SVG elements; use createElementNS instead' } }
        });

        let scriptElement: IAsyncHTMLElement;

        const validateScript = async (scriptData: ScriptParse) => {

            debug(`Validating hint create-element-svg`);

            const sourceCode = scriptData.sourceCode;
            const results = linter.verify(sourceCode, { rules: { 'svg-create': 'error' } });

            for (const result of results) {
                let position: ProblemLocation | null = scriptElement.getLocation() || null;
                let line = 0;

                /*
                 * Eslint returns location data starting at <script>
                 * This offsets the line number so that it is relative
                 * to the full source code and not just the <script> tag
                 */
                if (scriptElement) {
                    position = await findProblemLocation(scriptElement, { column: 0, line: 0 }, result.source === null ? '' : result.source);
                    line = position !== null ? position.line : 0;
                }
                await context.report(scriptData.resource, result.message, { location: { column: result.column, line: line + result.line }});
            }
        };

        const enterScript = (elementFound: ElementFound) => {
            scriptElement = elementFound.element;
        };

        context.on('element::script', enterScript);
        context.on('parse::end::javascript', validateScript);
    }
}
