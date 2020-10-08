import { Category } from '@hint/utils-types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HintScope } from 'hint/dist/src/lib/enums/hint-scope';
import { HintMetadata } from 'hint/dist/src/lib/types';
import { IHint } from 'hint/dist/src/lib/types';
import { getFullCSSCodeSnippet, getCSSLocationFromNode } from '@hint/utils-css';
import { StyleEvents, StyleParse } from '@hint/parser-css';
import { Severity } from '@hint/utils-types';

import { getMessage } from './i18n.import';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class IEFlexboxCompatHint implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.compatibility,
            description: getMessage('description', 'en'),
            name: getMessage('name', 'en')
        },
        /* istanbul ignore next */
        getDescription(language: string) {
            return getMessage('description', language);
        },
        /* istanbul ignore next */
        getName(language: string) {
            return getMessage('name', language);
        },
        id: 'ie-flexbox-compat',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext<StyleEvents>) {
        if (!context.targetedBrowsers.some((browser) => {
            return browser.toLowerCase().startsWith('ie ');
        })) {
            return;
        }

        let reported = false;

        context.on('parse::end::css', ({ ast, element, resource }: StyleParse) => {
            if (reported) {
                return;
            }

            ast.walkRules((rule) => {
                if (reported) {
                    return;
                }

                rule.each((declaration) => {
                    if (reported) {
                        return;
                    }

                    if (!('prop' in declaration)) {
                        return;
                    }

                    if (declaration.prop !== 'display' || !declaration.value.endsWith('flex')) {
                        return;
                    }

                    const codeSnippet = getFullCSSCodeSnippet(declaration);
                    const message = getMessage('usingFlexWithIE', context.language);
                    const location = getCSSLocationFromNode(declaration, { isValue: true });
                    const severity = Severity.warning;

                    context.report(
                        resource,
                        message,
                        { codeLanguage: 'css', codeSnippet, element, location, severity });
                    reported = true;
                });
            });
        });
    }
}
