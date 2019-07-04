/**
 * @fileoverview check for CSS rules that targets a summary tag and changes display to anything other than list-item
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { StyleEvents, StyleParse } from '@hint/parser-css';
import meta from './meta';
import selectorParser = require('postcss-selector-parser');

const parser = selectorParser();
const requiredAttribute = 'display';
const requiredValue = 'list-item';

export default class ValidateSummaryHint implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {

        const validateStyle = ({ ast, resource }: StyleParse) => {

            ast.walkRules((rule) => {

                if (!rule.selector.includes('summary')) {
                    return;
                }

                const validSelectors = parser.astSync(rule.selector).nodes.filter((node) => { // eslint-disable-line no-sync
                    if (!('nodes' in node)) {
                        return false;
                    }

                    const { nodes } = node;

                    // Reverse loop because if we find combinator before summary tag then it does not alter summary and we can break out
                    for (let i = nodes.length - 1; i >= 0; i--) {
                        const element = nodes[i];

                        if (element.type === 'combinator') {
                            return false;
                        }

                        if (element.type === 'tag' && element.value === 'summary') {
                            return true;
                        }
                    }

                    return false;
                });

                if (validSelectors.length) {
                    rule.walkDecls((decl) => {
                        const attribute = decl.prop;
                        const value = decl.value;

                        if (attribute === requiredAttribute && value !== requiredValue) {
                            context.report(resource, `Changing display of a summary tag hides open/close icon`);
                        }
                    });
                }

                return;
            });
        };

        context.on('parse::end::css', validateStyle);

    }
}
