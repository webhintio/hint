/**
 * @fileoverview Validate if HTML features used are supported in target browsers.
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint } from 'hint/dist/src/lib/types';
import { HTMLAttribute, HTMLElement } from '@hint/utils';
import { getUnsupported } from '@hint/utils/dist/src/compat';

import { filterBrowsers, joinBrowsers } from './utils/browsers';
import { resolveIgnore } from './utils/ignore';

import meta from './meta/html';
import { getMessage } from './i18n.import';

type ReportData = {
    feature: string;
    unsupported: string[];
};

type Context = {
    browsers: string[];
    ignore: Set<string>;
    report: (data: ReportData) => void;
};

const validateAttributeValue = (element: string, attr: HTMLAttribute, context: Context) => {
    if (context.ignore.has(`${element}[${attr.name}=${attr.value}]`)) {
        return;
    }

    const unsupported = getUnsupported({ attribute: attr.name, element, value: attr.value }, context.browsers);

    if (unsupported) {
        context.report({ feature: `${element}[${attr.name}=${attr.value}]`, unsupported });
    }
};

const validateAttribute = (element: string, attr: HTMLAttribute, context: Context) => {
    if (context.ignore.has(attr.name) || context.ignore.has(`${element}[${attr.name}]`)) {
        return;
    }

    const unsupported = getUnsupported({ attribute: attr.name, element }, context.browsers);

    if (unsupported) {
        context.report({ feature: `${element}[${attr.name}]`, unsupported });
    } else {
        validateAttributeValue(element, attr, context);
    }
};

const validateElement = (node: HTMLElement, context: Context) => {
    const element = node.nodeName.toLowerCase();

    if (context.ignore.has(element)) {
        return;
    }

    const unsupported = getUnsupported({ element }, context.browsers);

    if (unsupported) {
        context.report({ feature: element, unsupported });
    } else {
        for (let i = 0; i < node.attributes.length; i++) {
            validateAttribute(element, node.attributes[i], context);
        }
    }
};

export default class HTMLCompatHint implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext) {
        const ignore = resolveIgnore([
            'crossorigin',
            'integrity',
            'link[rel=manifest]',
            'main',
            'spellcheck'
        ], context.hintOptions);

        context.on('element::*', ({ element, resource }) => {
            const browsers = filterBrowsers(context.targetedBrowsers);

            const report = ({ feature, unsupported }: ReportData) => {
                const message = getMessage('featureNotSupported', context.language, [feature, joinBrowsers(unsupported)]);

                context.report(resource, message, { element });
            };

            validateElement(element, { browsers, ignore, report });
        });
    }
}
