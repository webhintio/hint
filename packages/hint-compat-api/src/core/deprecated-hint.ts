import { HintContext } from 'hint/dist/src/lib/hint-context';
import { SimpleSupportStatement, VersionValue } from '../types-mdn.temp';

import meta from '../meta/css';
import { APIHint } from './api-hint';
import { CSSFeatureStatus, CompatNamespace } from '../enums';
import { FeatureInfo, BrowsersInfo } from '../types';
import { Events, Event } from 'hint/dist/src/lib/types';

export class DeprecatedAPIHint<T extends Events, K extends Event> extends APIHint<T, K> {
    public static readonly meta = meta;

    public constructor(namespaceName: CompatNamespace, context: HintContext<T>) {
        super(namespaceName, context, false);
    }

    public getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue {
        return browserFeatureSupported.version_removed;
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

    public getContextualMessage() {
        return CSSFeatureStatus.Supported;
    }
}
