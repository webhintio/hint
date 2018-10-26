// Waiting for this PR https://github.com/mdn/browser-compat-data/pull/3004
const bcd: CompatData = require('mdn-browser-compat-data');

import { forEach } from 'lodash';
import { BrowserSupportCollection, MDNTreeFilteredByBrowsers } from '../types';
import { CompatData, CompatStatement, SupportStatement, SimpleSupportStatement } from '../types-mdn.temp'; // Temporal

type CompatNamespace = 'css' | 'javascript' | 'html';

export class CompatApi {
    public compatDataApi: MDNTreeFilteredByBrowsers; // Any because no types by the moment, check line 1
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

    public getSupportStatementFromInfo(browserFeatureSupported: SupportStatement | undefined): SimpleSupportStatement | undefined {
        // If we dont have information about the compatibility, ignore.
        if (!browserFeatureSupported) {
            return;
        }

        // Sometimes the API give an array but only the first seems relevant
        if (Array.isArray(browserFeatureSupported) && browserFeatureSupported.length > 0) {
            browserFeatureSupported = browserFeatureSupported[0];
        }

        return browserFeatureSupported as SimpleSupportStatement;
    }

    private isFeatureRequiredToTest(typedFeatureValue: CompatStatement & MDNTreeFilteredByBrowsers, isCheckingNotBroadlySupported = false): boolean {
        // TODO: Here we are checking only parent but this object has children
        let isRequiredToTest = false;

        forEach(this.browsers, (browserVersions, browser) => {
            if (isRequiredToTest || !typedFeatureValue.__compat || !typedFeatureValue.__compat.support) {
                return;
            }

            let browserFeatureSupported = this.getSupportStatementFromInfo((typedFeatureValue.__compat.support as any)[browser]);

            // If we dont have information about the compatibility, ignore.
            if (!browserFeatureSupported) {
                return;
            }

            const { version_added: addedVersion, version_removed: removedVersion } = browserFeatureSupported;

            if (isCheckingNotBroadlySupported) {
                // Check added
                console.log(addedVersion);

                return;
            }

            if (!removedVersion || isNaN(parseFloat(removedVersion.toString()))) {
                return;
            }

            if (browserVersions[browserVersions.length - 1] >= Number(removedVersion)) {
                isRequiredToTest = true;
            }
        });

        return isRequiredToTest;
    }
}
