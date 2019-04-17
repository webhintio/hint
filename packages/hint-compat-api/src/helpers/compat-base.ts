import { HintContext } from 'hint/dist/src/lib/hint-context';
import { Events, Event } from 'hint/dist/src/lib/types';

import { CompatFeaturesCache } from './compat-features-cache';
import { TestFeatureFunction, FeatureInfo, MDNTreeFilteredByBrowsers, ICompatLibrary, TestFeatureOptions } from '../types';
import { CompatStatement } from '../types-mdn.temp';

export abstract class CompatBase<T extends Events, K extends Event> implements ICompatLibrary {
    protected hintResource: string = 'unknown';
    protected MDNData: MDNTreeFilteredByBrowsers;
    protected hintContext: HintContext<T>;
    protected testFunction: TestFeatureFunction;
    private cachedFeatures: CompatFeaturesCache;

    public abstract searchFeatures(parser?: K): void

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

    public reportError(feature: FeatureInfo, message: string) {
        const { codeSnippet, location } = feature;

        this.hintContext.report(this.hintResource, message, { codeSnippet, location });
    }

    private isFeatureAlreadyReported(feature: FeatureInfo): boolean {
        return this.cachedFeatures.has(feature);
    }

    protected checkFeatureCompatibility(feature: FeatureInfo, collection: CompatStatement | undefined, options: TestFeatureOptions): boolean {
        if (!collection || this.isFeatureAlreadyReported(feature)) {
            return false;
        }

        const isFeatureSupported = this.testFunction(feature, collection, options);

        if (!isFeatureSupported) {
            this.cachedFeatures.add(feature);
        }

        return isFeatureSupported;
    }
}
