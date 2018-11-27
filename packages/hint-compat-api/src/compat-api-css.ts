/**
 * @fileoverview Hint to validate if the CSS features of the project are deprecated
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

export default class extends BaseCompatApiCSS {
    public constructor(context: HintContext<StyleEvents>) {
        super(context, CSSFeatureStatus.SUPPORTED);
    }

    public getFeatureVersionValueToAnalyze(browserFeatureSupported: SimpleSupportStatement): VersionValue {
        return browserFeatureSupported.version_removed;
    }

    public isVersionTestable(version: VersionValue): boolean {
        // If there is no removed version, it is not deprecated.
        return !!version;
    }

    public isVersionFeatureSupported(version: VersionValue): boolean {
        // Not a common case, but if removed version is exactly true, is always deprecated.
        return version !== true;
    }

    public isSupportedVersion(currentVersion: number, version: number) {
        return version < currentVersion;
    }
}
