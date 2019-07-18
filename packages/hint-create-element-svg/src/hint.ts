/**
 * @fileoverview Inform users that they need to use createElementNS to create SVG elements instead of createElement
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils/dist/src/debug';
import { ScriptEvents } from '@hint/parser-javascript';

import meta from './meta';
import svgElements from './svgElements';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

export default class CreateElementSvgHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<ScriptEvents>) {

        /*
         * Check to see if any call expression in the AST has a callee with
         * a 'createElement' property. If yes, check if that call expression's
         * first argument is an SVG element. In that case, report an error as
         * the correct identifier property for creating SVG elements is
         * 'createElementNS'
         */
        context.on('parse::end::javascript', ({ ast, element, resource, sourceCode, walk }) => {

            debug('Validating hint create-element-svg');

            walk.simple(ast, {
                CallExpression(node) {
                    if (!('property' in node.callee && 'name' in node.callee.property)) {
                        return;
                    }

                    if (node.callee.property.name !== 'createElement') {
                        return;
                    }

                    const arg = node.arguments[0];

                    if (arg && 'value' in arg && typeof arg.value === 'string' && svgElements.has(arg.value.toLowerCase())) {
                        const message = getMessage('svgElementCannotBeCreated', context.language);
                        const loc = node.callee.property.loc;
                        const codeLanguage = 'javascript';

                        let codeSnippet = '';
                        let location = null;

                        if (loc) {
                            codeSnippet = sourceCode.substring((node as any).start, (node as any).end);
                            location = {
                                column: loc.start.column,
                                line: loc.start.line - 1
                            };
                        }

                        context.report(resource, message, { codeLanguage, codeSnippet, element, location });
                    }
                }
            });
        });
    }
}
