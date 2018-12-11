/**
 * @fileoverview Hint to validate if the CSS features of the project are not broadly supported
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { StyleEvents } from '@hint/parser-css/dist/src/types';
import { SimpleSupportStatement, VersionValue } from './types-mdn.temp';

import meta from './meta/css-next';
import BaseCCSHint from './css-base';
import { CSSFeatureStatus } from './enums';
import { FeatureInfo, BrowsersInfo } from './types';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */


type UserPrefixes = {
    [key: string]: boolean;
};

export default class CCSNextHint extends BaseCCSHint {
    public static readonly meta = meta;

    private userPrefixes: UserPrefixes = {};
    public constructor(context: HintContext<StyleEvents>) {
        super(context, CSSFeatureStatus.Added, true);
    }

    public getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue {
        return browserFeatureSupported.version_added;
    }

    public isVersionValueTestable(version: VersionValue): boolean {
        /**
         * NOTE:
         * If `addedVersion` is true, it means the property has always been implemented
         * If `addedVersion` is null, it means the status is not clear so we are not checking it
         */
        return version !== true && version !== null;
    }

    public isVersionValueSupported(version: VersionValue): boolean {
        // Not a common case, but if added version does not exist, was not added.
        return !!version;
    }

    public isSupportedVersion(browser: BrowsersInfo, feature: FeatureInfo, currentVersion: number, version: number): boolean {
        const isVersionGreaterOrEqualThanCurrentVersion = version >= currentVersion;

        if (isVersionGreaterOrEqualThanCurrentVersion) {
            this.addUserUsedPrefixes(browser.name, feature);
        }

        return isVersionGreaterOrEqualThanCurrentVersion || this.isPrefixAlreadyInUse(browser.name, feature);
    }

    private addUserUsedPrefixes(browserName: string, feature: FeatureInfo): void {
        if (!feature.prefix) {
            return;
        }

        this.userPrefixes[browserName + feature.name] = true;
    }

    private isPrefixAlreadyInUse (browserName: string, feature: FeatureInfo): boolean {
        return !feature.prefix && !!this.userPrefixes[browserName + feature.name];
    }
}
