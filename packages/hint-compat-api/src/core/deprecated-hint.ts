import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Events } from 'hint/dist/src/lib/types';

import { APIHint } from './api-hint';
import { CompatNamespace } from '../enums';
import { FeatureInfo, BrowsersInfo } from '../types';
import { SimpleSupportStatement, VersionValue, StatusBlock } from '../types-mdn.temp';

export abstract class DeprecatedAPIHint<T extends Events> extends APIHint<T> {
    abstract getDefaultHintOptions(): any;

    public constructor(namespaceName: CompatNamespace, context: HintContext<T>) {
        super(namespaceName, context, false);
    }

    public getFeatureVersionValueToAnalyze(browserFeatureSupport: SimpleSupportStatement, status: StatusBlock): VersionValue {
        if (browserFeatureSupport.version_added === false && status && status.deprecated) {
            // NOTE: We are handling never implemented feature as removed
            return true;
        }

        return browserFeatureSupport.version_removed;
    }

    public isVersionValueTestable(version: VersionValue): boolean {
        // If there is no removed version, it is not deprecated.
        return !!version;
    }

    public isVersionValueSupported(version: VersionValue): boolean {
        // Not a common case, but if removed version is exactly true, is always deprecated.
        return version !== true;
    }

    public isSupportedVersion(browser: BrowsersInfo, feature: FeatureInfo, currentVersion: number, version: number) {
        return version < currentVersion;
    }
}
