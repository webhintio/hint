// Waiting for this PR https://github.com/mdn/browser-compat-data/pull/3004
const bcd: CompatData = require('mdn-browser-compat-data');

import { forEach } from 'lodash';
import { BrowserSupportCollection } from '../types';
import { CompatData, Identifier, CompatStatement } from '../types-mdn.temp'; // Temporal
import { isArray } from 'util';

type CompatNamespace = 'css' | 'javascript' | 'html';

export class CompatApi {
    private compatDataApi: Identifier; // Any because no types by the moment, check line 1
    private browsers: BrowserSupportCollection;

    public constructor(namespaceName: CompatNamespace, browsers: BrowserSupportCollection, isCheckingNotBroadlySupported = false) {
        this.browsers = browsers;
        this.compatDataApi = bcd[namespaceName];
        this.compatDataApi = this.applyBrowsersConfiguration(isCheckingNotBroadlySupported);
    }

    private applyBrowsersConfiguration(isCheckingNotBroadlySupported = false): any {
        const compatDataApi = {} as Identifier;

        forEach(this.compatDataApi, (groupFeaturesValues, groupFeaturesKey) => {
            const groupFeatures = {} as CompatStatement & Identifier;

            forEach(groupFeaturesValues, (featureValue, featureKey) => {
                const typedFeatureValue = featureValue as CompatStatement & Identifier;

                if (!this.isFeatureRequiredToTest(typedFeatureValue, isCheckingNotBroadlySupported)) {
                    return;
                }

                groupFeatures[featureKey] = typedFeatureValue;
            });

            compatDataApi[groupFeaturesKey] = groupFeatures;
        });

        return compatDataApi;
    }

    private isFeatureRequiredToTest(typedFeatureValue: CompatStatement & Identifier, isCheckingNotBroadlySupported = false): boolean {
        // TODO: Here we are checking only parent but this object has children
        let isRequiredToTest = false;

        forEach(this.browsers, (browserVersions, browser) => {
            if (isRequiredToTest || !typedFeatureValue.__compat || !typedFeatureValue.__compat.support) {
                return;
            }

            let browserFeatureSupported = (typedFeatureValue.__compat.support as any)[browser];

            // If we dont have information about the compatibility, ignore.
            if (!browserFeatureSupported) {
                return;
            }

            // Sometimes the API give an array but only the first seems relevant
            if (isArray(browserFeatureSupported) && browserFeatureSupported.length > 0) {
                browserFeatureSupported = browserFeatureSupported[0];
            }

            const { version_added: addedVersion, version_removed: removedVersion } = browserFeatureSupported;

            if (isCheckingNotBroadlySupported) {
                // Check added
                console.log(addedVersion);

                return;
            }

            if (!removedVersion || isNaN(parseFloat(removedVersion))) {
                return;
            }

            if (browserVersions[browserVersions.length - 1] >= Number(removedVersion)) {
                isRequiredToTest = true;
            }
        });

        return isRequiredToTest;
    }
}
