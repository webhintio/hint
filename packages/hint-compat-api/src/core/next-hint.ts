import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Events, Event } from 'hint/dist/src/lib/types';

import { APIHint } from './api-hint';
import { CompatNamespace } from '../enums';
import { FeatureInfo, BrowsersInfo } from '../types';
import { SimpleSupportStatement, VersionValue } from '../types-mdn.temp';

export abstract class NextAPIHint<T extends Events, K extends Event> extends APIHint<T, K> {
    private userPrefixes = new Set<string>();

    abstract getDefaultHintOptions(): any;

    public constructor(namespaceName: CompatNamespace, context: HintContext<T>) {
        super(namespaceName, context, true);
    }

    public getFeatureVersionValueToAnalyze(browserFeatureSupport: SimpleSupportStatement): VersionValue {
        return browserFeatureSupport.version_added;
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

        this.userPrefixes.add(browserName + feature.name);
    }

    private isPrefixAlreadyInUse (browserName: string, feature: FeatureInfo): boolean {
        return !feature.prefix && this.userPrefixes.has(browserName + feature.name);
    }
}
