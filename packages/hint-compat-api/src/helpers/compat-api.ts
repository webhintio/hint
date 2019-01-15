/**
 * @fileoverview Helper that contains all the logic related with compat api, to use in different modules.
 */

// Waiting for this PR https://github.com/mdn/browser-compat-data/pull/3004
const mdnAPI: CompatData = require('mdn-browser-compat-data');

import { get } from 'lodash';

import { CompatNamespace } from '../enums';
import { browserVersions } from './normalize-version';
import { BrowserSupportCollection, MDNTreeFilteredByBrowsers, BrowserVersions, FeatureInfo } from '../types';
import { CompatData, CompatStatement, SupportStatement, SimpleSupportStatement, Identifier, VersionValue } from '../types-mdn.temp'; // Temporal

export class CompatAPI {
    public compatDataApi: MDNTreeFilteredByBrowsers;

    public readonly excludedFeatures: string[];
    private readonly isCheckingNotBroadlySupported: boolean;
    private readonly mdnBrowsersCollection: BrowserSupportCollection;

    public constructor(namespaceName: CompatNamespace, mdnBrowsersCollection: BrowserSupportCollection, isCheckingNotBroadlySupported: boolean = false, excludeFeatures: string[]) {
        this.excludedFeatures = excludeFeatures;
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
            const filteredFeature = this.getFeatureByBrowsers(featureKey, featureValue);

            if (!filteredFeature) {
                return;
            }

            namespaceFeatures[featureKey] = filteredFeature;
        });

        return namespaceFeatures;
    }

    private getFeatureByBrowsers(featureKey: string, featureValue: CompatStatement & MDNTreeFilteredByBrowsers): CompatStatement | null {
        if (this.isExcludedFeature(featureKey)) {
            return null;
        }

        const childrenFeatures = this.getFeaturesAndChildrenRequiredToTest(featureValue);
        const hasChildrenFeatures = Object.keys(childrenFeatures).length > 0;
        const typedFeatures = { ...childrenFeatures, __compat: featureValue.__compat } as CompatStatement & MDNTreeFilteredByBrowsers;


        if (!hasChildrenFeatures && !this.isFeatureRequiredToTest(featureKey, featureValue)) {
            return null;
        }

        return typedFeatures;
    }

    private getFeaturesAndChildrenRequiredToTest(featureValue: CompatStatement & MDNTreeFilteredByBrowsers): CompatStatement {
        const typedFeatures = {} as CompatStatement & MDNTreeFilteredByBrowsers;

        if (typeof featureValue === 'object') {
            Object.entries(featureValue as object).forEach(([childKey, childValue]) => {
                if (!this.isExcludedFeature(childKey) && this.isFeatureRequiredToTest(childKey, childValue)) {
                    typedFeatures[childKey] = childValue;
                }
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
            currentBrowserFeatureSupported = currentBrowserFeatureSupported.find((info) => {
                if (info.flags) {
                    return false;
                }

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
    public getWorstCaseSupportStatementFromInfo(browserFeatureSupported: SupportStatement): SimpleSupportStatement | null {
        // If we don't have information about the compatibility, ignore.
        if (!browserFeatureSupported) {
            return null;
        }

        if (Array.isArray(browserFeatureSupported)) {
            // Take the smaller version_removed and bigger version_added
            let addedVersion: VersionValue = null;
            let removedVersion: VersionValue = null;

            browserFeatureSupported.forEach((info: SimpleSupportStatement) => {
                // We should skip SimpleSupportStatement including flags information
                if (info.flags) {
                    return;
                }

                if (!addedVersion && info.version_added === true) {
                    addedVersion = true;
                }

                if (!addedVersion || addedVersion && info.version_added && info.version_added > addedVersion) {
                    addedVersion = info.version_added;
                }

                if (!removedVersion && info.version_removed === true) {
                    removedVersion = true;
                }

                if (!removedVersion || removedVersion && info.version_removed && info.version_removed < removedVersion) {
                    removedVersion = info.version_removed;
                }
            });

            return {
                version_added: addedVersion,
                version_removed: removedVersion
            };
        }

        return browserFeatureSupported as SimpleSupportStatement;
    }
    /* eslint-enable camelcase */

    private isFeatureRequiredToTest(featureName: string, typedFeatureValue: CompatStatement & MDNTreeFilteredByBrowsers): boolean {
        if (!this.hasValidCompatibilityInfo(typedFeatureValue)) {
            return false;
        }

        const { support, status } = typedFeatureValue.__compat as CompatStatement;

        return Object.entries(this.mdnBrowsersCollection).some(([browser, browserVersionsList]: [string, number[]]): boolean => {
            const browserFeatureSupported = this.getWorstCaseSupportStatementFromInfo((support as any)[browser]);

            // If we don't have information about the compatibility, ignore.
            if (!browserFeatureSupported) {
                return false;
            }

            const isFeatureDeprecated = status && status.deprecated;
            const mustCheckBooleanAddedVersion = this.isCheckingNotBroadlySupported !== isFeatureDeprecated;
            const { version_added: addedVersion, version_removed: removedVersion } = browserFeatureSupported;

            if (mustCheckBooleanAddedVersion && typeof addedVersion === 'boolean' && addedVersion === false) {
                return true;
            }

            if (this.isCheckingNotBroadlySupported) {
                // Version check
                if (typeof addedVersion !== 'boolean' && addedVersion && browserVersionsList[0] <= browserVersions.normalize(addedVersion)) {
                    return true;
                }
            } else {
                // Boolean check
                if (typeof removedVersion === 'boolean' && removedVersion === true) {
                    return true;
                }

                // Version check
                if (typeof removedVersion !== 'boolean' && removedVersion && browserVersionsList[browserVersionsList.length - 1] >= browserVersions.normalize(removedVersion)) {
                    return true;
                }
            }

            return false;
        });
    }

    private isExcludedFeature(featureName: string): boolean {
        return this.excludedFeatures.includes(featureName);
    }

    private hasValidCompatibilityInfo(featureValue: MDNTreeFilteredByBrowsers): boolean {
        return featureValue &&
            !!featureValue.__compat &&
            !!featureValue.__compat.support;
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

    public getFeatureCompatStatement(collection: CompatStatement, feature: FeatureInfo): CompatStatement {
        try {
            const accessor = feature.subFeature ?
                [feature.name, feature.subFeature.name] :
                [feature.name];

            const identifier: Identifier = get(collection, accessor);

            if (!this.hasValidCompatibilityInfo(identifier)) {
                throw new Error('Missing compatibility information');
            }

            return identifier.__compat as CompatStatement;
        } catch (error) {
            return { status: {}, support: {} } as CompatStatement;
        }
    }
}
