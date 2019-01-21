import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Events, Event } from 'hint/dist/src/lib/types';

import { CompatFeaturesCache } from './compat-features-cache';
import { TestFeatureFunction, FeatureInfo, MDNTreeFilteredByBrowsers } from '../types';
import { CompatStatement } from '../types-mdn.temp';

export abstract class CompatBase<T extends Events, K extends Event> {
    protected hintResource: string = 'unknown';
    protected MDNData: MDNTreeFilteredByBrowsers;
    protected hintContext: HintContext<T>;
    protected testFunction: TestFeatureFunction;
    private cachedFeatures: CompatFeaturesCache;

    public abstract async searchFeatures(parser?: K): Promise<void>

    public constructor(hintContext: HintContext<T>, MDNData: MDNTreeFilteredByBrowsers, testFunction: TestFeatureFunction) {
        if (!testFunction) {
            throw new Error('You must set a test function before testing a feature.');
        }

        this.cachedFeatures = new CompatFeaturesCache();
        this.testFunction = testFunction;
        this.hintContext = hintContext;
        this.MDNData = MDNData;

        // Clear feature cache between scans. Contexts like extension-vscode scan multiple times.
        (this.hintContext as HintContext<Events>).on('scan::end', () => {
            this.cachedFeatures = new CompatFeaturesCache();
        });
    }

    public setResource(hintResource: string): void {
        this.hintResource = hintResource;
    }

    public async reportError(feature: FeatureInfo, message: string): Promise<void> {
        const { location } = feature;

        await this.hintContext.report(this.hintResource, message, { location });
    }

    private isFeatureAlreadyReported(feature: FeatureInfo): boolean {
        return this.cachedFeatures.has(feature);
    }

    protected checkFeatureCompatibility(feature: FeatureInfo, collection: CompatStatement| undefined): void {
        if (this.isFeatureAlreadyReported(feature)) {
            return;
        }

        const isFeatureSupported = this.testFunction(feature, collection);

        if (!isFeatureSupported) {
            this.cachedFeatures.add(feature);
        }
    }
}
