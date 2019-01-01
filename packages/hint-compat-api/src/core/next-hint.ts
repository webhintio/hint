import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Events, Event } from 'hint/dist/src/lib/types';

import meta from '../meta/css-next';
import { APIHint } from './api-hint';
import { CompatNamespace } from '../enums';
import { FeatureInfo, BrowsersInfo, UserPrefixes } from '../types';
import { SimpleSupportStatement, VersionValue } from '../types-mdn.temp';

export class NextAPIHint<T extends Events, K extends Event> extends APIHint<T, K> {
    public static readonly meta = meta;

    private userPrefixes: UserPrefixes = {};

    public constructor(namespaceName: CompatNamespace, context: HintContext<T>) {
        super(namespaceName, context, true);
    }

    public getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue {
        return browserFeatureSupported.version_added;
    }

    public isVersionValueTestable(version: VersionValue): boolean {
        /**
         * NOTE:
         * If version_added is true, it means the property has always been implemented
         * If version_added is null, it means the status is not clear so we are not checking it
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
