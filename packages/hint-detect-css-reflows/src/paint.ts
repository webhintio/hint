/**
 * @fileoverview Let the developers know of what operations will be triggered by changes on the css properties
 */

import * as path from 'path';
import { Declaration, Rule } from 'postcss';

import { HintContext } from 'hint/dist/src/lib/hint-context';
// The list of types depends on the events you want to capture.
import { IHint} from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils-debug';
import { Severity } from '@hint/utils-types';
import { StyleEvents, StyleParse } from '@hint/parser-css';
import { loadJSONFile } from '@hint/utils-fs';
import { getCSSLocationFromNode, getUnprefixed } from '@hint/utils-css';
const cssPropertiesObject = loadJSONFile(path.join(__dirname, 'assets', 'CSSReflow.json')) || {};

import { getMessage } from './i18n.import';

import meta from './meta/paint';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class DetectCssPaintHint implements IHint {

    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {

        // Your code here.
        const validateRule = (rule: Rule) => {
            // Code to validate the hint on the event when an element is visited.

            debug(`Validating hint-detect-css-reflows`);
            const results = new Set<Declaration>();

            rule.each((decl) => {
                if (!('prop' in decl) || (decl.toString() ==='not valid')) {
                    return;
                }

                const name = decl.prop;
                const baseName = getUnprefixed(name);
                const propertyName = cssPropertiesObject[baseName];

                if (propertyName && propertyName.paint) {
                    results.add(decl);
                }
            });

            return results;
        };

        const formatMessage = (declaration: Declaration): string => {
            const propertyName = declaration.prop;
            const affectedTriggers = cssPropertiesObject[propertyName];
            const cssDeclarationTrigger = Object.getOwnPropertyNames(affectedTriggers).map((item) => {
                if (item === 'paint' && affectedTriggers[item]) {
                    return `${item.charAt(0).toLocaleUpperCase()}${item.slice(1).toLowerCase()}`;
                }

                return null;
            });

            const triggeredCSSChangesArray = cssDeclarationTrigger.filter((item) => {
                return item !== null;
            }).join(', ');

            return getMessage('willTriggerLayout', context.language, [propertyName, triggeredCSSChangesArray]);
        };

        context.on('parse::end::css', ({ ast, element, resource }: StyleParse) => {
            debug('Validating hint-detect-css-reflows');

            ast.walkRules((rule) => {
                const results = validateRule(rule);

                for (const declaration of results) {
                    const location = getCSSLocationFromNode(declaration, { isValue: false });
                    const severity = Severity.hint;
                    const message = formatMessage(declaration);

                    context.report(
                        resource,
                        message,
                        {
                            codeLanguage: 'css',
                            element,
                            location,
                            severity
                        });
                }
            });
        });
        // As many events as you need
    }
}
