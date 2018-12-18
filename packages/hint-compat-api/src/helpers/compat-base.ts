import { HintContext } from 'hint/dist/src/lib/hint-context';

import { CachedCompatFeatures } from './cached-compat-features';
import { MDNTreeFilteredByBrowsers, TestFeatureFunction, FeatureInfo } from '../types';

export abstract class CompatBase<T> {
    protected testFunction: TestFeatureFunction;
    protected hintContext: HintContext;
    protected hintResource: string = 'unknown';
    private cachedFeatures: CachedCompatFeatures;

    public abstract async searchFeatures(data: MDNTreeFilteredByBrowsers, parser: T): Promise<void>

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

    public isFeatureAlreadyInUse(feature: FeatureInfo): boolean {
        if (this.cachedFeatures.has(feature)) {
            return true;
        }

        this.cachedFeatures.add(feature);

        return false;
    }
}
