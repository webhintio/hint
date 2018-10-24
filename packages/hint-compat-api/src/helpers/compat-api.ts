// Waiting for this PR https://github.com/mdn/browser-compat-data/pull/3004
const bcd: CompatData = require('mdn-browser-compat-data');

import { forEach } from 'lodash';
import { BrowserSupportCollection } from '../types';
import { CompatData, Identifier, CompatStatement } from '../types-mdn.temp'; // Temporal

type CompatNamespace = 'css' | 'javascript' | 'html';

type BrowserVersionsInfo = {
    version_added: string;
    version_removed?: string;
}

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

            const browserTermSupported = (typedTermValue.__compat.support as any)[browser] as BrowserVersionsInfo;

            // If we dont have information about the compatibility, ignore.
            if (!browserTermSupported) {
                return;
            }

            const { version_added, version_removed } = browserTermSupported;

            if (isCheckingNotBroadlySupported) {
                // Check added
                return;
            }

            if (!version_removed || isNaN(parseFloat(version_removed))) {
                return;
            }

            if (browserVersions[browserVersions.length - 1] >= Number(version_removed)) {
                isRequiredToTest = true;
            }
        });

        return isRequiredToTest;
    }
}
