// Waiting for this PR https://github.com/mdn/browser-compat-data/pull/3004
const bcd: CompatData = require('mdn-browser-compat-data');

import { some, forEach } from 'lodash';
import { browserVersions } from './normalize-version';
import { BrowserSupportCollection, MDNTreeFilteredByBrowsers } from '../types';
import { CompatData, CompatStatement, SupportStatement, SimpleSupportStatement } from '../types-mdn.temp'; // Temporal

type CompatNamespace = 'css' | 'javascript' | 'html';

export class CompatApi {
    public compatDataApi: MDNTreeFilteredByBrowsers; // Any because no types at the moment, check line 1
    private browsers: BrowserSupportCollection;

    public constructor(namespaceName: CompatNamespace, browsers: BrowserSupportCollection, isCheckingNotBroadlySupported = false) {
        this.browsers = browsers;
        this.compatDataApi = bcd[namespaceName];
        this.compatDataApi = this.applyBrowsersConfiguration(isCheckingNotBroadlySupported);
    }

    private applyBrowsersConfiguration(isCheckingNotBroadlySupported = false): any {
        const compatDataApi = {} as MDNTreeFilteredByBrowsers;

        forEach(this.compatDataApi, (namespaceFeaturesValues, namespaceFeaturesKey) => {
            const namespaceFeatures = {} as CompatStatement & MDNTreeFilteredByBrowsers;

            forEach(namespaceFeaturesValues, (featureValue, featureKey) => {
                const typedFeatureValue = featureValue as CompatStatement & MDNTreeFilteredByBrowsers;

                // First check all the children
                let isChildRequired = false;

                if (typeof featureValue === 'object' && Object.keys(featureValue).length > 1) {

                    forEach(featureValue, (childValue, childKey) => {

                        if (!this.isFeatureRequiredToTest(childValue, isCheckingNotBroadlySupported)) {
                            return;
                        }

                        isChildRequired = true;
                    });
                }

                if (!isChildRequired && !this.isFeatureRequiredToTest(typedFeatureValue, isCheckingNotBroadlySupported)) {
                    return;
                }

                namespaceFeatures[featureKey] = typedFeatureValue;
            });

            compatDataApi[namespaceFeaturesKey] = namespaceFeatures;
        });

        return compatDataApi;
    }

    public getPrefix(name: string): [string | undefined, string] {
        const regexp = new RegExp(`-(moz|o|webkit|ms)-`, 'gi');
        const matched = name.match(regexp);

        return matched && matched.length > 0 ? [matched[0], name.replace(matched[0], '')] : [undefined, name];
    }

    public getSupportStatementFromInfo(browserFeatureSupported?: SupportStatement, prefix?: string): SimpleSupportStatement | undefined {
        let currentBrowserFeatureSupported = browserFeatureSupported;

        // If we dont have information about the compatibility, ignore.
        if (!currentBrowserFeatureSupported) {
            return currentBrowserFeatureSupported;
        }

        if (!Array.isArray(currentBrowserFeatureSupported) && currentBrowserFeatureSupported.prefix && currentBrowserFeatureSupported.prefix !== prefix) {
            return undefined;
        }

        // Sometimes the API give an array but only the first seems relevant
        if (Array.isArray(currentBrowserFeatureSupported) && currentBrowserFeatureSupported.length > 0) {
            if (prefix) {
                currentBrowserFeatureSupported = currentBrowserFeatureSupported.find((info) => {
                    return info.prefix === prefix;
                });
            } else {
                currentBrowserFeatureSupported = currentBrowserFeatureSupported.find((info) => {
                    return !info.prefix;
                });
            }
        }

        return currentBrowserFeatureSupported as SimpleSupportStatement;
    }

    /* eslint-disable camelcase */
    public getWorstCaseSupportStatementFromInfo(browserFeatureSupported: SupportStatement | undefined): SimpleSupportStatement | undefined {
        // If we don't have information about the compatibility, ignore.
        if (!browserFeatureSupported) {
            return browserFeatureSupported;
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

    private isFeatureRequiredToTest(typedFeatureValue: CompatStatement & MDNTreeFilteredByBrowsers, isCheckingNotBroadlySupported = false): boolean {
        return some(this.browsers, (browserVersionsList, browser): boolean => {
            if (!typedFeatureValue.__compat || !typedFeatureValue.__compat.support) {
                return false;
            }

            const browserFeatureSupported = this.getWorstCaseSupportStatementFromInfo((typedFeatureValue.__compat.support as any)[browser]);

            // If we dont have information about the compatibility, ignore.
            if (!browserFeatureSupported) {
                return false;
            }

            const { version_added: addedVersion, version_removed: removedVersion } = browserFeatureSupported;

            if (isCheckingNotBroadlySupported && (addedVersion || addedVersion === false || browserVersionsList[0] <= browserVersions.normalize(addedVersion as string))) {
                return true;
            } else if (removedVersion || browserVersionsList[browserVersionsList.length - 1] >= browserVersions.normalize(removedVersion as string)) {
                return true;
            }

            return false;
        });
    }
}
