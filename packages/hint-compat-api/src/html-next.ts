/**
 * @fileoverview Hint to validate if the HTML features of the project are not broadly supported
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HTMLEvents } from '../../parser-html/dist/src/types';

import BaseHTMLHint from './html-base';
import meta from './meta/html-next';
import { CSSFeatureStatus } from './enums';
import { VersionValue, SimpleSupportStatement } from './types-mdn.temp';
import { BrowsersInfo, FeatureInfo, UserPrefixes } from './types';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class BaseHTMLNextHint extends BaseHTMLHint {
    public static readonly meta = meta;

    private userPrefixes: UserPrefixes = {};

    public constructor(context: HintContext<HTMLEvents>) {
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
