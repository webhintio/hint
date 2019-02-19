/**
 * @fileoverview Inform users that they need to use createElementNS to create SVG elements instead of createElement
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { ScriptEvents, ScriptParse } from '@hint/parser-javascript';

import { Linter } from 'eslint';
import * as ESTree from 'estree';

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

        const validateScript = async (scriptData: ScriptParse) => {

            debug(`Validating hint create-element-svg`);

            const sourceCode = scriptData.sourceCode;
            const results = linter.verify(sourceCode, { rules: { 'svg-create': 'error' } });

            for (const result of results) {
                await context.report(scriptData.resource, result.message);
            }
        };

        context.on('parse::end::javascript', validateScript);
    }
}
