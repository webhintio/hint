import { AlternativeDetails, UnsupportedBrowsers } from '@hint/utils/dist/src/compat/browsers';

import { getMessage } from '../i18n.import';

import { formatSupported } from './browsers';

export type BrowserAlternativeDetails = AlternativeDetails & {
    browser: string;
};

/**
 * Sort alternatives into groups based on those recommending the same
 * alternative feature.
 *
 * E.g. if both "edge 12" and "ie 11" specify an alternative with the
 * name `-ms-grid`, then they will end up in the same group with
 * `-ms-grid` as the key.
 */
const groupAlternatives = (unsupported: UnsupportedBrowsers) => {
    const groupedAlternatives = new Map<string, BrowserAlternativeDetails[]>();

    for (const browser of unsupported.browsers) {
        const details = unsupported.details.get(browser);

        if (details && details.alternative) {
            const { name } = details.alternative;
            const group = groupedAlternatives.get(name) || [];

            group.push({ browser, ...details.alternative });
            groupedAlternatives.set(name, group);
        }
    }

    return groupedAlternatives;
};

/**
 * Serialize alternative support for a feature into a list of statements.
 * Alternatives are de-duped and multiple browsers are grouped by the name
 * of the alternative feature (e.g. `-ms-grid`).
 *
 * Passed a `language` of `en`, `formatFeature` prefixing with `display: `
 * and the following `unsupported` data:
 *
 * ```ts
 * {
 *     browsers: ['ie 11'],
 *     details: new Map([
 *         ['ie 11', { alternative: { name: '-ms-grid', versionAdded: '10' }]
 *     ])
 * }
 * ```
 *
 * Returns:
 *
 * ```ts
 * ["Add 'display: -ms-grid' to support Internet Explorer 10+."]
 * ```
 */
export const formatAlternatives = (language: string, unsupported: UnsupportedBrowsers, formatFeature?: (name: string) => string): string[] => {
    const groupedAlternatives = groupAlternatives(unsupported);
    const alternativeMessages = new Set<string>();

    for (const [name, list] of groupedAlternatives) {
        const formattedName = formatFeature ? formatFeature(name) : name;
        const browsers = list.map(({ browser, versionAdded, versionRemoved }) => {
            return formatSupported(browser, versionAdded, versionRemoved);
        });

        const uniqueBrowsers = [...new Set(browsers)].sort();

        alternativeMessages.add(getMessage('featureAlternative', language, [formattedName, uniqueBrowsers.join(', ')]));
    }

    return [...alternativeMessages];
};
