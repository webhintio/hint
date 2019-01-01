/**
 * @fileoverview Helper that contains all the logic related with compat api, to use in different modules.
 */

// Waiting for this PR https://github.com/mdn/browser-compat-data/pull/3004
const mdnAPI: CompatData = require('mdn-browser-compat-data');

import { get } from 'lodash';

import { CompatNamespace } from '../enums';
import { browserVersions } from './normalize-version';
import { BrowserSupportCollection, MDNTreeFilteredByBrowsers, BrowserVersions, FeatureInfo } from '../types';
import { CompatData, CompatStatement, SupportStatement, SimpleSupportStatement, Identifier, SupportBlock } from '../types-mdn.temp'; // Temporal

export class CompatAPI {
    public compatDataApi: MDNTreeFilteredByBrowsers;
    private readonly isCheckingNotBroadlySupported: boolean;
    private readonly mdnBrowsersCollection: BrowserSupportCollection;

    public constructor(namespaceName: CompatNamespace, mdnBrowsersCollection: BrowserSupportCollection, isCheckingNotBroadlySupported = false) {
        this.mdnBrowsersCollection = mdnBrowsersCollection;
        this.isCheckingNotBroadlySupported = isCheckingNotBroadlySupported;
        this.compatDataApi = this.filterCompatDataByBrowsers(mdnAPI[namespaceName]);
    }

    private filterCompatDataByBrowsers(namespaceFeature: {[namespaceFeaturesKey: string]: CompatStatement | undefined}): MDNTreeFilteredByBrowsers {
        const compatDataApi: MDNTreeFilteredByBrowsers = {};


        Object.entries(namespaceFeature).forEach(([namespaceFeaturesKey, namespaceFeaturesValues]) => {
            compatDataApi[namespaceFeaturesKey] = this.filterNamespacesDataByBrowsers(namespaceFeaturesValues);
        });

        return compatDataApi;
    }

    private filterNamespacesDataByBrowsers(namespaceFeaturesValues?: CompatStatement): CompatStatement & Identifier {
        const namespaceFeatures = {} as CompatStatement & MDNTreeFilteredByBrowsers;

        Object.entries(namespaceFeaturesValues as object).forEach(([featureKey, featureValue]) => {
            const filteredFeature = this.getFeatureByBrowsers(featureValue);

            if (!filteredFeature) {
                return;
            }

            namespaceFeatures[featureKey] = filteredFeature;
        });

        return namespaceFeatures;
    }

    private getFeatureByBrowsers(featureValue: CompatStatement & MDNTreeFilteredByBrowsers): CompatStatement | null {
        const childrenFeatures = this.getFeaturesAndChildrenRequiredToTest(featureValue);
        const hasChildrenFeatures = Object.keys(childrenFeatures).length > 0;
        const typedFeatures = { ...childrenFeatures, __compat: featureValue.__compat } as CompatStatement & MDNTreeFilteredByBrowsers;

        if (!hasChildrenFeatures && !this.isFeatureRequiredToTest(featureValue)) {
            return null;
        }

        return typedFeatures;
    }

    private getFeaturesAndChildrenRequiredToTest(featureValue: CompatStatement & MDNTreeFilteredByBrowsers): CompatStatement {
        const typedFeatures = {} as CompatStatement & MDNTreeFilteredByBrowsers;

        if (typeof featureValue === 'object' && Object.keys(featureValue).length) {
            Object.entries(featureValue as object)
                .filter(([_, childValue]) => {
                    return this.isFeatureRequiredToTest(childValue);
                })
                .forEach(([childKey, childValue]) => {
                    typedFeatures[childKey] = childValue;
                });
        }

        return typedFeatures;
    }

    /**
     * @method getSupportStatementFromInfo
     * Checks mdn compat data for support info on the targeted browsers.
     * In it's simplest form, the data defaults to info provided in an object of the non-prefixed version of the feature.
     * Sometimes though, it is an array. In this case, we get the info relevant to the user.
     * Example:
     * firefox: [{version_added: "29"}, {prefix: "-webkit-", version_added: 22}, {prefix: "-moz-", version_added: 20}]
     * If the user wishes to target firefox browsers and has not used a prefix, the support statement returned will be {version_added: "29"}
     * If the user has used a prefix and the prefix is "-webkit", the support statement returned will be {prefix: "-webkit-", version_added: 22}
     * If the user has used a prefix and the prefix is "-moz", the support statement returned will be {prefix: "-webkit-", version_added: 20}
     */
    public getSupportStatementFromInfo(browserFeatureSupported?: SupportStatement, prefix?: string): SimpleSupportStatement | null {
        let currentBrowserFeatureSupported = browserFeatureSupported;

        // If we don't have information about the compatibility, ignore.
        if (!currentBrowserFeatureSupported) {
            return null;
        }

        if (!Array.isArray(currentBrowserFeatureSupported) && currentBrowserFeatureSupported.prefix && currentBrowserFeatureSupported.prefix !== prefix) {
            return null;
        }

        // Sometimes the API returns an array but only the first seems relevant
        if (Array.isArray(currentBrowserFeatureSupported) && currentBrowserFeatureSupported.length > 0) {
            currentBrowserFeatureSupported = currentBrowserFeatureSupported
                .filter((info) => {
                    return !info.flags;
                })
                .find((info) => {
                    return prefix ? info.prefix === prefix : !info.prefix;
                });
        }

        return currentBrowserFeatureSupported as SimpleSupportStatement;
    }

    /* eslint-disable camelcase */
    /**
     * @method getWorstCaseSupportStatementFromInfo
     * {version_added: "43"} returns {version_added: "43", version_removed: undefined}
     * {version_added: "12", version_removed: "15"} returns {version_added: "412", version_removed: "15"}
     * [{version_added: "43"}, {prefix: "-webkit-", version_added: true}] is reduced to {version_added: "43", version_removed: undefined}
     * [{version_added: "29"}, {prefix: "-webkit-", version_added: 21}] is reduced to {version_added: "29", version_removed: undefined}
     * [{version_added: "12.1", "version_removed": "15"}, {prefix: "-o-", version_added: 12, version_removed: false}] is reduced to {version_added: "15", version_removed: 15}
     * [{version_added: "12.1", "version_removed": "15"}, {prefix: "-webkit-", version_added: 12, version_removed: 13}] is reduced to {version_added: "15", version_removed: 13}
     */
    public getWorstCaseSupportStatementFromInfo(browserFeatureSupported: SupportStatement | null): SimpleSupportStatement | null {
        // If we don't have information about the compatibility, ignore.
        if (!browserFeatureSupported) {
            return null;
        }

        // Take the smaller version_removed and bigger version_added
        const worstBrowserFeatureSupported: SimpleSupportStatement = {
            version_added: null,
            version_removed: null
        };

        if (Array.isArray(browserFeatureSupported) && browserFeatureSupported.length > 0) {
            // We should remove flags information
            const normalizedBrowserFeatureSupported = browserFeatureSupported.filter((info) => {
                return !info.flags;
            });

            normalizedBrowserFeatureSupported.forEach((info) => {
                if (!worstBrowserFeatureSupported.version_added && info.version_added === true) {
                    worstBrowserFeatureSupported.version_added = true;
                }

                if (!worstBrowserFeatureSupported.version_added || worstBrowserFeatureSupported.version_added && info.version_added && info.version_added > worstBrowserFeatureSupported.version_added) {
                    worstBrowserFeatureSupported.version_added = info.version_added;
                }

                if (!worstBrowserFeatureSupported.version_removed && info.version_removed === true) {
                    worstBrowserFeatureSupported.version_removed = true;
                }

                if (!worstBrowserFeatureSupported.version_removed || worstBrowserFeatureSupported.version_removed && info.version_removed && info.version_removed < worstBrowserFeatureSupported.version_removed) {
                    worstBrowserFeatureSupported.version_removed = info.version_removed;
                }
            });

            return worstBrowserFeatureSupported;
        }

        return browserFeatureSupported as SimpleSupportStatement;
    }
    /* eslint-enable camelcase */

    private isFeatureRequiredToTest(typedFeatureValue: CompatStatement & MDNTreeFilteredByBrowsers): boolean {
        if (!typedFeatureValue.__compat || !typedFeatureValue.__compat.support) {
            return false;
        }

        const { support, status } = typedFeatureValue.__compat;

        return Object.entries(this.mdnBrowsersCollection).some(([browser, browserVersionsList]: [string, number[]]): boolean => {
            const browserFeatureSupported = this.getWorstCaseSupportStatementFromInfo((support as any)[browser]);

            // If we don't have information about the compatibility, ignore.
            if (!browserFeatureSupported) {
                return false;
            }

            const { version_added, version_removed } = browserFeatureSupported;
            const isDeprecated = status && status.deprecated

            if (this.isCheckingNotBroadlySupported) {
                if (typeof version_added === 'boolean' && version_added === false && !isDeprecated) {
                    return true;
                }

                // Version check
                if (typeof version_added !== 'boolean' && version_added && browserVersionsList[0] <= browserVersions.normalize(version_added)) {
                    return true;
                }
            } else {
                // Boolean check

                if (typeof version_added === 'boolean' && version_added === false && isDeprecated) {
                    return true;
                }

                // Boolean check
                if (typeof version_removed === 'boolean' && version_removed === true) {
                    return true;
                }

                // Version check
                if (typeof version_removed !== 'boolean' && version_removed && browserVersionsList[browserVersionsList.length - 1] >= browserVersions.normalize(version_removed)) {
                    return true;
                }
            }

            return false;
        });
    }

    /**
     * @method groupNotSupportedVersions
     * Examples:
     * [ 'chrome 66', 'chrome 69' ] into ['chrome 66, 69']
     * [ 'chrome 67', 'chrome 68', 'chrome 69' ] into ['chrome 67-69']
     * [ 'chrome 66', 'chrome 68', 'chrome 69' ] into ['chrome 66, 67-69']
     *
     */
    public groupNotSupportedVersions(notSupportedVersions: string[]): string[] {
        if (!notSupportedVersions) {
            return [];
        }

        const browsers: BrowserVersions = {};

        notSupportedVersions.forEach((browserAndVersion: string) => {
            const [browser, version] = browserAndVersion.split(' ');

            browsers[browser] = browsers[browser] || [];
            browsers[browser].push(version);
        });

        const groupedVersions = Object.entries(browsers).map(([browser, versions]) => {
            const sortedVersions = versions.sort();
            let grouped = '';
            let groupStarted = false;

            sortedVersions.forEach((value, i) => {
                const nextValue = sortedVersions[i + 1];
                const nNextValue = nextValue ? browserVersions.normalize(nextValue) : null;
                const nValue = browserVersions.normalize(value);

                if (!groupStarted) {
                    grouped += `${browser} ${value}`;
                }

                if (nNextValue && nNextValue - nValue > browserVersions.unit) {
                    if (groupStarted) {
                        groupStarted = false;
                        grouped += value;
                    }

                    grouped += ', ';
                }

                if (!groupStarted && nNextValue && nNextValue - nValue <= browserVersions.unit) {
                    groupStarted = true;
                    grouped += '-';
                }

                if (groupStarted && !nextValue) {
                    groupStarted = false;
                    grouped += value;
                }
            });

            return grouped;
        });

        return groupedVersions;
    }

    public isBrowserIncludedInCollection(browserName: string): boolean {
        return this.mdnBrowsersCollection.hasOwnProperty(browserName);
    }

    public getBrowserVersions(browserName: string): number[] {
        return this.mdnBrowsersCollection[browserName] || [];
    }

    public getSupportBlock(collection: CompatStatement | undefined, feature: FeatureInfo): SupportBlock {
        try {
            /**
             * // NOTE:
             * - If feature is not in the filtered by browser data,
             *   that means that is always supported.
             * - If feature does not have compat data, we ignore it.
             */

            const accessor = feature.subFeature ?
                [feature.name, feature.subFeature.name] :
                [feature.name];

            const identifier: Identifier = get(collection, accessor);

            if (!identifier || !identifier.__compat) {
                throw new Error('Missing compatibility information');
            }

            return identifier.__compat.support;
        } catch (error) {
            return {} as SupportBlock;
        }
    }
}
