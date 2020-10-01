/**
 * @fileoverview Inform users about classList.add or classList.remove with leading '.' in the argument pitfall
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils-debug';
import { Severity } from '@hint/utils-types';
import { ScriptEvents } from '@hint/parser-javascript';

import meta from './meta';
import { getMessage } from './i18n.import';

const debug: debug.IDebugger = d(__filename);

export default class ClassListAddOrRemovePitfall implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<ScriptEvents>) {

        /*
         * Check to see if any call expression in the AST has a callee with
         * a 'classList.add' or 'classList.remove' property. If yes, check if
         * that call expression's first argument contains a leading '.'. In
         * that case, report a warning as the leading '.' may lead to an
         * undesireable pitfall
         */
        context.on('parse::end::javascript', ({ ast, element, resource, sourceCode, walk }) => {

            debug('Validating hint classlist-add-remove-pitfall');

            walk.ancestor(ast, {
                CallExpression(node, ancestor) {
                    if (!('property' in node.callee && 'name' in node.callee.property)) {
                        return;
                    }

                    if (node.callee.property.name !== 'add' && node.callee.property.name !== 'remove') {
                        return;
                    }

                    const arg = node.arguments[0];

                    if (arg && 'value' in arg && typeof arg.value === 'string' && arg.value.startsWith('.') && node.arguments.length === 1) {
                        const message = getMessage('classListAddOrRemovePitfall', context.language);
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

                        context.report(
                            resource,
                            message,
                            {
                                codeLanguage,
                                codeSnippet,
                                element,
                                location,
                                severity: Severity.warning
                            });
                    }
                }
            });
        });
    }
}
