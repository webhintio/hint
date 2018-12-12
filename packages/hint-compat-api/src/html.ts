/**
 * @fileoverview Hint to validate if the HTML features of the project are deprecated
 */

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HTMLEvents } from '../../parser-html/dist/src/types';

import BaseHTMLHint from './html-base';
import meta from './meta/html';
import { CSSFeatureStatus } from './enums';
import { SimpleSupportStatement, VersionValue } from './types-mdn.temp';
import { FeatureInfo, BrowsersInfo } from './types';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class HTMLHint extends BaseHTMLHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<HTMLEvents>) {
        super(context, CSSFeatureStatus.Supported, false);
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
}
