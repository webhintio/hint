// Waiting for this PR https://github.com/mdn/browser-compat-data/pull/3004
const bcd: CompatData = require('mdn-browser-compat-data');

import { forEach } from 'lodash';
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

                if (!this.isFeatureRequiredToTest(typedFeatureValue, isCheckingNotBroadlySupported)) {
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
        // If we dont have information about the compatibility, ignore.
        if (!browserFeatureSupported) {
            return browserFeatureSupported;
        }

        // Take the smaller version_removed and bigger version_added
        const worstBrowserFeatureSupported: SimpleSupportStatement = {
            version_added: null,
            version_removed: null
        };

        if (Array.isArray(browserFeatureSupported) && browserFeatureSupported.length > 0) {
            browserFeatureSupported.forEach((info) => {
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
        // TODO: Here we are checking only parent but this object has children
        let isRequiredToTest = false;

        forEach(this.browsers, (browserVersionsList, browser) => {
            if (isRequiredToTest || !typedFeatureValue.__compat || !typedFeatureValue.__compat.support) {
                return;
            }

            const browserFeatureSupported = this.getWorstCaseSupportStatementFromInfo((typedFeatureValue.__compat.support as any)[browser]);

            // If we dont have information about the compatibility, ignore.
            if (!browserFeatureSupported) {
                return;
            }

            const { version_added: addedVersion, version_removed: removedVersion } = browserFeatureSupported;

            if (isCheckingNotBroadlySupported) {
                if (!addedVersion || isNaN(parseFloat(addedVersion.toString()))) {
                    return;
                }

                if (addedVersion || browserVersionsList[0] <= browserVersions.normalize(addedVersion)) {
                    isRequiredToTest = true;
                }
            } else {
                if (!removedVersion || isNaN(parseFloat(removedVersion.toString()))) {
                    return;
                }

                if (removedVersion || browserVersionsList[browserVersionsList.length - 1] >= browserVersions.normalize(removedVersion)) {
                    isRequiredToTest = true;
                }
            }
        });

        return isRequiredToTest;
    }
}
