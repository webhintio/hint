import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Events, Event } from 'hint/dist/src/lib/types';

import meta from '../meta/css';
import { APIHint } from './api-hint';
import { CompatNamespace } from '../enums';
import { FeatureInfo, BrowsersInfo } from '../types';
import { SimpleSupportStatement, VersionValue, StatusBlock } from '../types-mdn.temp';

export class DeprecatedAPIHint<T extends Events, K extends Event> extends APIHint<T, K> {
    public static readonly meta = meta;

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
