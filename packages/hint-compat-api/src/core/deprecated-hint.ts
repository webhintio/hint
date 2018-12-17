import { HintContext } from 'hint/dist/src/lib/hint-context';
import { StyleEvents } from '@hint/parser-css/dist/src/types';
import { SimpleSupportStatement, VersionValue } from '../types-mdn.temp';

import meta from '../meta/css';
import { APIHint } from './api-hint';
import { CSSFeatureStatus, CompatNamespace } from '../enums';
import { FeatureInfo, BrowsersInfo } from '../types';
import { HTMLEvents } from '../../../parser-html/dist/src/types';

export class DeprecatedAPIHint extends APIHint {
    public static readonly meta = meta;

    public constructor(namespaceName: CompatNamespace, context: HintContext<StyleEvents | HTMLEvents>) {
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
