import { MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { HTMLParse } from '../../../parser-html/dist/src/types';
import { StyleParse } from '../../../parser-css/dist/src/types';
import { CachedCompatFeatures } from './cached-compat-features';
import { CompatStatement, SupportBlock, Identifier } from '../types-mdn.temp';

import { get } from 'lodash';

export abstract class CompatBase {
    protected testFunction: TestFeatureFunction;
    protected hintContext: HintContext;
    protected hintResource: string = 'unknown';
    private cachedFeatures: CachedCompatFeatures;

    public abstract async searchFeatures(data: MDNTreeFilteredByBrowsers, parser: StyleParse | HTMLParse): Promise<void>

    public constructor(hintContext: HintContext, testFunction: TestFeatureFunction) {
        if (!testFunction) {
            throw new Error('You must set a test function before testing a feature.');
        }

        this.cachedFeatures = new CachedCompatFeatures();
        this.testFunction = testFunction;
        this.hintContext = hintContext;
    }

    public setResource(hintResource: string): void {
        this.hintResource = hintResource;
    }

    public async reportError(feature: FeatureInfo, message: string): Promise<void> {
        const { location } = feature;

        await this.hintContext.report(this.hintResource, message, { location });
    }

    public getSupportBlock(collection: CompatStatement | undefined, feature: FeatureInfo): SupportBlock {
        try {
            /**
             * // NOTE:
             * - If feature is not in the filtered by browser data,
             *   that means that is always supported.
             * - If feature does not have compat data, we ignore it.
             */

            const accessor = feature.subFeature ?
                [feature.name, feature.subFeature.name] :
                [feature.name];

            const identifier: Identifier = get(collection, accessor);

            if (!identifier || !identifier.__compat) {
                throw new Error('Missing compatibility information');
            }

            return identifier.__compat.support;
        } catch (error) {
            return {} as SupportBlock;
        }
    }

    public isFeatureAlreadyInUse(feature: FeatureInfo): boolean {
        if (this.cachedFeatures.has(feature)) {
            return true;
        }

        this.cachedFeatures.add(feature);

        return false;
    }
}
