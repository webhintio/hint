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

        forEach(this.compatDataApi, (groupTermsValues, groupTermsKey) => {
            const groupTerms = {} as CompatStatement & Identifier;

            forEach(groupTermsValues, (termValue, termKey) => {
                const typedTermValue = termValue as CompatStatement & Identifier;

                if (!this.isTermRequiredToTest(typedTermValue, isCheckingNotBroadlySupported)) {
                    return;
                }

                groupTerms[termKey] = typedTermValue;
            });

            compatDataApi[groupTermsKey] = groupTerms;
        });

        return compatDataApi;
    }

    private isTermRequiredToTest(typedTermValue: CompatStatement & Identifier, isCheckingNotBroadlySupported = false): boolean {
        // TODO: Here we are checking only parent but this object has children
        let isRequiredToTest = false;

        forEach(this.browsers, (browserVersions, browser) => {
            if (isRequiredToTest || !typedTermValue.__compat || !typedTermValue.__compat.support) {
                return;
            }

            let browserTermSupported = (typedTermValue.__compat.support as any)[browser];

            // If we dont have information about the compatibility, ignore.
            if (!browserTermSupported) {
                return;
            }

            // Sometimes the API give an array but only the first seems relevant
            if (isArray(browserTermSupported) && browserTermSupported.length > 0) {
                browserTermSupported = browserTermSupported[0];
            }

            const { version_added: addedVersion, version_removed: removedVersion } = browserTermSupported;

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
