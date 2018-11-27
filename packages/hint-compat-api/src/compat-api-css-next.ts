/**
 * @fileoverview Hint to validate if the CSS features of the project are not broadly supported
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { StyleEvents } from '@hint/parser-css/dist/src/types';
import { SimpleSupportStatement, VersionValue } from './types-mdn.temp';

import BaseCompatApiCSS from './compat-api-css-base';
import { CSSFeatureStatus } from './enums';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

/* type UserPrefixes = {
    [key: string]: boolean;
}; */

export default class extends BaseCompatApiCSS {
    /* private userPrefixes: UserPrefixes = {}; */
    public constructor(context: HintContext<StyleEvents>) {
        super(context, CSSFeatureStatus.ADDED, true);
    }

    public getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue {
        return browserFeatureSupported.version_added;
    }

    public isVersionTestable(version: VersionValue): boolean {
        // If `addedVersion` is true, it means the property has always been implemented
        return version !== true;
    }

    public isVersionFeatureSupported(version: VersionValue): boolean {
        // Not a common case, but if added version does not exist, was not added.
        return !!version;
    }

    public isSupportedVersion(currentVersion: number, version: number) {
        return version >= currentVersion;
    }

    // FIXME: This is not checking anything
/*     private addUserUsedPrefixes(browserName: string, featureName: string): void {
        this.userPrefixes[browserName + featureName] = true;
    }

    private checkUserUsedPrefixes (browserName: string, featureName: string): boolean {
        return this.userPrefixes[browserName + featureName];
    } */
}
